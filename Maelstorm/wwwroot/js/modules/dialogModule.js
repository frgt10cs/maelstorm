﻿/**
 *
 * 
 * 
 **/


let dialogModule = (function () {        
    let _uploadCount;    
    let dialogContext;   

    let decryptMessages = function (messages) {
        let promises = [];
        for (let i = 0; i < messages.length; i++) {
            promises.push(cryptoModule.decryptAes(dialogContext.key, messages[i].IV, messages[i].text));
        }
        return Promise.all(promises);
    }

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
                messageModule.setElement(messages[i], isMessageFromOther(messages[i]));
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
                messageModule.setElement(messages[i], isMessageFromOther(messages[i]));
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
        api.getUnreadedMessages(dialogContext.id, _uploadCount).then(messages => { unreadedMessagesHandler(messages); }, error => { console.log(error); });
    };

    let uploadReadedMessages = function () {
        api.getReadedMessages(dialogContext.id, dialogContext.readedMessagesOffset, _uploadCount).then(messages => { readedMessagesHandler(messages); }, error => { console.log(error); });
    };

    let createDialog = async function (serverDialog) {      
        serverDialog.isPanelOpened = false;
        serverDialog.unreadedMessages = [];
        serverDialog.messages = [];
        serverDialog.unconfirmedMessages = [];
        serverDialog.readedMessagesOffset = 0;
        serverDialog.allReadedUploaded = false;
        serverDialog.allUnreadedUploaded = false;
        serverDialog.uploadingBlocked = false;
        serverDialog.messagesPanel = createMessagesPanel();
        serverDialog.element = dialogGuiModule.createDialogLi(serverDialog);
        serverDialog.key = await cryptoModule.decryptRsa(serverDialog.encryptedKey, accountModule.getPrivateKey());
        return serverDialog;
    };

    let firstDialogMessagesUploading = function () {
        uploadReadedMessages();
    };

    let createMessage = async function () {
        let message = {};
        let text = messageModule.validText(dialogGuiModule.getMessageText());
        if (text !== "") {
            let IV = cryptoModule.generateIV();
            message.IVBase64 = encodingModule.arrayToBase64(IV);
            message.text = await cryptoModule.encryptAes(dialogContext.key, message.IV, text);
            message.targetId = dialogContext.interlocutorId;
            let bindId = dialogContext.unconfirmedMessages.length;
            message.dateOfSending = new Date();
            message.status = -1;
            message.bindId = bindId;
            return message;
        }
        return null;        
    };

    let sendMessage = function (message) {       
        addNewMessage(message);
        dialogContext.unconfirmedMessages.push(message);  
        api.sendDialogMessage(message, (result) => {
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
            messageModule.setElement(message, isFromOther);            
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
        dialogContext.element.lastElementChild.lastElementChild.innerText = dateModule.getDate(new Date(message.dateOfSending));
        dialogsGuiModule.toTheTop(dialogContext);
    };

    var updateInterlocutorStatus = function () {
        api.getOnlineStatuses([dialogContext.interlocutorId]).then(statuses => {
            dialogGuiModule.getDialogStatusDiv().innerText = statuses[0].isOnline ? "online" : "offline";
        });
    };

    return {

        init: function (uploadCount) {
            dialogGuiModule.init();
            _uploadCount = uploadCount;            
            dialogGuiModule.getMessageSendBtn().onclick = function () {
                sendMessage(createMessage());
                dialogGuiModule.clearMessageTextInput();
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
            dialogGuiModule.setDialog(dialogContext.title);    
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

        decryptMessages: decryptMessages,

        addNewMessage: addNewMessage,

        unreadedMessagesHandler: unreadedMessagesHandler,

        readedMessagesHandler: readedMessagesHandler,  

        sendMessage: sendMessage,

        uploadUnreadedMessages: uploadUnreadedMessages,

        uploadReadedMessages: uploadUnreadedMessages
    };
})();

let dialogGuiModule = (function () {
    let dateModule;
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
        init: function () {            
            dialogTitleDiv = document.getElementById("dialogInfoTitle");
            dialogStatusDiv = document.getElementById("dialogInfoStatus");
            messageTextBox = document.getElementById("messageTextBox");
            messageSendBtn = document.getElementById("messageSendBtn");  
            if (window.screen.width < 992)
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
            dialogDate.innerText = dialog.lastMessageDate !== null ? dateModule.getDate(new Date(dialog.lastMessageDate)) : "";

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