let dialogModule = (function () {
    let _api;
    let _date;
    let _guiManager;   
    let _uploadCount;
    let _message;
    let onNewMessage;
    let dialogContext;   

    let appendMessageToBegin = function (message) {
        dialogContext.messagesPanel.prepend(message.element);
    };

    let appendMessageToEnd = function (message) {
        dialogContext.messagesPanel.appendChild(message.element);
    };

    let createMessagesPanel = function () {
        let element = document.createElement("div");
        element.classList.add("conversationMessages");
        element.classList.add("hideScroll");
        element.style.display = "none";
        element.onscroll = function () {
            onMessagesPanelScroll();
        };
        return element;
    };

    let onMessagesPanelScroll = function () {
        if (!dialogContext.uploadingBlocked) {
            if (dialogContext.messagesPanel.scrollTop < 10 && !dialogContext.allReadedUpload) {
                console.log("old upl");
                dialogContext.uploadingBlocked = true;
                uploadReadedMessages();
            }
            else if (dialogContext.messagesPanel.scrollHeight - dialogContext.messagesPanel.scrollTop - dialogContext.messagesPanel.offsetHeight < 10
                && !dialogContext.allUnreadedUpload && dialogContext.unreadedMessages.length === 0) {
                console.log("new upl");
                dialogContext.uploadingBlocked = true;
                uploadUnreadedMessages();
            }
        }
    };  

    let isMessageFromOther = function (message) {
        return dialogContext.interlocutorId === message.authorId;
    };

    let unreadedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allUnreadedUpload = true;
            for (let i = 0; i < messages.length; i++) {
                _message.setElement(messages[i], isMessageFromOther(messages[i]));
                appendMessageToEnd(messages[i]);
                dialogContext.unreadedMessages.push(messages[i]);
            }
        }
        else {
            dialogContext.allUnreadedUpload = true;
        }
        dialogContext.uploadingBlocked = false;
    };

    let readedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allReadedUpload = true;
            dialogContext.readedMessagesOffset += messages.length;
            let resultScrollTop = 0;
            for (let i = 0; i < messages.length; i++) {
                _message.setElement(messages[i], isMessageFromOther(messages[i]));
                appendMessageToBegin(messages[i]);
                dialogContext.messages.unshift(messages[i]);
                resultScrollTop += messages[i].element.offsetHeight;
            }
            dialogContext.messagesPanel.scrollTop = resultScrollTop;
        }
        else {
            dialogContext.allReadedUpload = true;
        }
        dialogContext.uploadingBlocked = false;
    };  

    let uploadUnreadedMessages = function () {
        _api.getUnreadedMessages(dialogContext.id, _uploadCount, unreadedMessagesHandler);
    };

    let uploadReadedMessages = function () {
        _api.getReadedMessages(dialogContext.id, dialogContext.readedMessagesOffset, _uploadCount, readedMessagesHandler);
    };

    let createDialog = function (serverDialog) {      
        serverDialog.isPanelOpened = false;
        serverDialog.unreadedMessages = [];
        serverDialog.messages = [];
        serverDialog.unconfirmedMessages = [];
        serverDialog.readedMessagesOffset = 0;
        serverDialog.allReadedUploaded = false;
        serverDialog.allUnreadedUploaded = false;
        serverDialog.uploadingBlocked = false;
        serverDialog.messagesPanel = createMessagesPanel();
        serverDialog.element = _guiManager.createDialogLi(serverDialog);
        return serverDialog;
    };

    let firstDialogMessagesUploading = function () {
        uploadReadedMessages();
    };

    let createMessage = function () {
        let message = {};
        _message.setText(message, _guiManager.getMessageText());        
        message.targetId = dialogContext.interlocutorId;
        let id = dialogContext.unconfirmedMessages.length;
        message.dateOfSending = new Date();
        message.status = -1;
        message.bindId = id;
        return message;
    };

    let sendMessage = function (message) {       
        addNewMessage(message);
        dialogContext.unconfirmedMessages.push(message);  
        _api.sendDialogMessage(message, (result) => {
            let info = JSON.parse(result.data);
            let confirmedMessage = dialogContext.unconfirmedMessages[info.bindId];
            confirmedMessage.id = info.id;
            confirmedMessage.element.id = info.id;
            confirmedMessage.statusDiv.style.backgroundImage = "url(/images/delivered.png)";
            dialogContext.unconfirmedMessages[info.bindId] = undefined;
        });              
    };

    let addNewMessage = function (message) {
        if (dialogContext.isPanelOpened) {            
            let isFromOther = isMessageFromOther(message);
            _message.setElement(message, isFromOther);            
            if (isFromOther) {
                dialogContext.unreadedMessages.push(message);
            } else {
                dialogContext.messages.push(message);
                dialogContext.readedMessagesOffset++;
            }
            appendMessageToEnd(message);
        }        
        let previewText = dialogContext.element.lastElementChild.children[1].lastElementChild.lastElementChild;
        previewText.innerText = message.text;
        dialogContext.element.lastElementChild.lastElementChild.innerText = _date.getDate(new Date(message.dateOfSending));
        onNewMessage(dialogContext);
    };

    var updateInterlocutorStatus = function () {
        _api.getOnlineStatuses([dialogContext.interlocutorId], function (statuses) {
            _guiManager.getDialogStatusDiv().innerText = statuses[0].isOnline ? "online" : "offline";
        });
    };

    return {

        init: function (api, guiManager, messageModule, dateModule, uploadCount, onNewMessageHandler) {
            _api = api;
            _guiManager = guiManager;
            _message = messageModule;
            _date = dateModule;
            _uploadCount = uploadCount;
            onNewMessage = onNewMessageHandler;
            _guiManager.getMessageSendBtn().onclick = function () {
                sendMessage(createMessage());
                _guiManager.clearMessageTextInput();
            };
        },

        setDialogContext: function (dialog) {
            dialogContext = dialog;
        },

        openDialog: function () {
            if (!dialogContext.isPanelOpened) {                
                firstDialogMessagesUploading();
            }
            dialogContext.isPanelOpened = true;
            dialogContext.messagesPanel.style.display = "block";
            _guiManager.setDialog(dialogContext.title);    
            updateInterlocutorStatus();
        },        

        createDialog: createDialog,

        createDialogs: function (serverDialogs) {
            var dialogs = [];
            for (let i = 0; i < serverDialogs.length; i++) {
                dialogs.push(createDialog(serverDialogs[i]));
            }
            return dialogs;
        },

        addNewMessage: addNewMessage,

        unreadedMessagesHandler: unreadedMessagesHandler,

        readedMessagesHandler: readedMessagesHandler,  

        sendMessage: sendMessage,

        uploadUnreadedMessages: uploadUnreadedMessages,

        uploadReadedMessages: uploadUnreadedMessages
    };
})();

let dialogGuiModule = (function () {
    let _date;
    let dialogTitleDiv;
    let dialogStatusDiv;
    let messageSendBtn;
    let messageTextBox;    

    let smallDeviceMenuInit = function () {
        let dialogListContainer = document.getElementById("dialogListContainer");
        let openedDialogContainer = document.getElementById("openedDialogContainer");

        let openDialogListBtn = document.getElementById("openDialogListBtn");
        let openOpenedDialogBtn = document.getElementById("openOpenedDialogBtn");

        openDialogListBtn.onclick = function () {
            dialogListContainer.className = dialogListContainer.className.replace("d-none", "d-block");
            openedDialogContainer.className = openedDialogContainer.className.replace("d-flex", "d-none");
            openOpenedDialogBtn.className = openOpenedDialogBtn.className.replace("bg-dark-5", "bg-dark-2");
            openDialogListBtn.className = openDialogListBtn.className.replace("bg-dark-2", "bg-dark-5");
        }

        openOpenedDialogBtn.onclick = function () {
            dialogListContainer.className = dialogListContainer.className.replace("d-block", "d-none");
            openedDialogContainer.className = openedDialogContainer.className.replace("d-none", "d-flex");
            openOpenedDialogBtn.className = openOpenedDialogBtn.className.replace("bg-dark-2", "bg-dark-5");
            openDialogListBtn.className = openDialogListBtn.className.replace("bg-dark-5", "bg-dark-2");
        }
    }

    return {
        init: function (dateModule) {
            _date = dateModule;
            dialogTitleDiv = document.getElementById("dialogInfoTitle");
            dialogStatusDiv = document.getElementById("dialogInfoStatus");
            messageTextBox = document.getElementById("messageTextBox");
            messageSendBtn = document.getElementById("messageSendBtn");  
            //if (window.screen.width < 992)
                smallDeviceMenuInit();
        },

        createDialogLi: function (dialog) {
            var element = document.createElement("li");            
            element.className = "list-group-item mt-1 bg-dark-2 text-white border-0";
            element.id = dialog.id;

            var dialogInner = document.createElement("div");
            dialogInner.className = "row position-relative";

            var photoContainer = document.createElement("div");
            photoContainer.className = "col-auto pl-0 pr-0";

            var photoDiv = document.createElement("div");
            photoDiv.className = "dialogPhoto";
            photoDiv.style.backgroundImage = "url('/images/" + dialog.image + "')";

            var dialogPreviewContainer = document.createElement("div");
            dialogPreviewContainer.className = "col-8";

            var dialogPreview = document.createElement("div");
            dialogPreview.className = "dialogPreview";

            var dialogTitle = document.createElement("div");
            dialogTitle.className = "dialogTitle";
            dialogTitle.innerText = dialog.title;

            var dialogMessage = document.createElement("div");
            dialogMessage.className = "dialogTextPreview";
            dialogMessage.innerText = dialog.lastMessageText !== null ? dialog.lastMessageText : "";

            var dialogDate = document.createElement("div");
            dialogDate.className = "dialogDate";
            dialogDate.innerText = dialog.lastMessageDate !== null ? _date.getDate(new Date(dialog.lastMessageDate)) : "";

            photoContainer.appendChild(photoDiv);
            dialogPreview.appendChild(dialogTitle);
            dialogPreview.appendChild(dialogMessage);
            dialogPreviewContainer.appendChild(dialogPreview);
            dialogInner.appendChild(photoContainer);
            dialogInner.appendChild(dialogPreviewContainer);
            dialogInner.appendChild(dialogDate);
            element.appendChild(dialogInner);

            return element;
        },

        getDialogTitleDiv: function () { return dialogTitleDiv; },
        getDialogStatusDiv: function () { return dialogStatusDiv; },
        getMessageText: function () { return messageTextBox.value; },
        getMessageSendBtn: function () { return messageSendBtn },   

        clearMessageTextInput: function () { messageTextBox.value = ""; },

        setDialog: function (title) {
            dialogTitleDiv.innerText = title;            
        }        
    };
})();