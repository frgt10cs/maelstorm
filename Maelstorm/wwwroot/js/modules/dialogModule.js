var dialogModule = (function () {
    var _api;
    var _guiManager;
    var _uploadCount;
    var _message;
    var onNewMessage;
    var dialogContext;   

    var appendMessageToBegin = function (message) {
        dialogContext.messagesPanel.prepend(message.element);
    };

    var appendMessageToEnd = function (message) {
        dialogContext.messagesPanel.appendChild(message.element);
    };

    var createMessagesPanel = function () {
        var element = document.createElement("div");
        element.classList.add("conversationMessages");
        element.style.display = "none";
        element.onscroll = function () {
            onMessagesPanelScroll();
        };
        return element;
    };

    var onMessagesPanelScroll = function () {
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

    var isMessageFromOther = function (message) {
        return dialogContext.interlocutorId === message.authorId;
    };

    var unreadedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allUnreadedUpload = true;
            for (var i = 0; i < messages.length; i++) {
                _message.createMessageElement(messages[i], isMessageFromOther(messages[i]));
                appendMessageToEnd(messages[i]);
                dialogContext.unreadedMessages.push(messages[i]);
            }
        }
        else {
            dialogContext.allUnreadedUpload = true;
        }
        dialogContext.uploadingBlocked = false;
    };

    var readedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allReadedUpload = true;
            dialogContext.readedMessagesOffset += messages.length;
            var resultScrollTop = 0;
            for (var i = 0; i < messages.length; i++) {
                _message.createMessageElement(messages[i], isMessageFromOther(messages[i]));
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

    var uploadUnreadedMessages = function () {
        _api.getUnreadedMessages(dialogContext.id, _uploadCount, unreadedMessagesHandler);
    };

    var uploadReadedMessages = function () {
        _api.getReadedMessages(dialogContext.id, dialogContext.readedMessagesOffset, _uploadCount, readedMessagesHandler);
    };

    var createDialog = function (serverDialog) {      
        serverDialog.isPanelOpened = false;
        serverDialog.unreadedMessages = [];
        serverDialog.messages = [];
        serverDialog.unconfirmedMessages = [];
        serverDialog.readedMessagesOffset = 0;
        serverDialog.allReadedUploaded = false;
        serverDialog.allUnreadedUploaded = false;
        serverDialog.uploadingBlocked = false;
        serverDialog.messagesPanel = createMessagesPanel();
        serverDialog.element = _guiManager.createDialogDiv(serverDialog);
        return serverDialog;
    };

    var firstDialogMessagesUploading = function () {
        uploadReadedMessages();
    };

    return {

        init: function (api, guiManager, messageModule, dateModule, uploadCount, onNewMessageHandler) {
            _api = api;
            _guiManager = guiManager;
            _message = messageModule;
            _dateModule = dateModule;
            _uploadCount = uploadCount;
            onNewMessage = onNewMessageHandler;
        },

        setDialogContext: function (dialog) {
            dialogContext = dialog;
        },

        openDialog: function () {
            if (!dialog.isPanelOpened) {
                firstDialogMessagesUploading();
            }
            dialogContext.isPanelOpened = true;
            dialogContext.messagesPanel.style.display = "block";
            _guiManager.setDialog(dialogContext.title, dialogContext.status);            
        },

        createDialog: createDialog,
        createDialogs: function (serverDialogs) {
            var dialogs = [];
            for (var i = 0; i < serverDialogs.length; i++) {
                dialogs.push(createDialog(serverDialogs[i]));
            }
            return dialogs;
        },

        addNewMessage: function (message) {
            if (dialogContext.isPanelOpened) {
                appendMessageToEnd(message);
                var isFromOther = message.authorId === dialog.interlocutorId;
                message.CreateMessageElement(isFromOther);
                if (isFromOther) {
                    dialogContext.unreadedMessages.push(message);
                } else {
                    dialogContext.messages.push(message);
                    dialogContext.readedMessagesOffset++;
                }
            }
            var preView = dialogContext.element.lastElementChild.lastElementChild;
            preView.firstElementChild.innerText = message.text;
            preView.lastElementChild.innerText = GetDate(new Date(message.dateOfSending));
            onNewMessage();            
        },

        unreadedMessagesHandler: unreadedMessagesHandler,

        readedMessagesHandler: readedMessagesHandler,  

        sendMessage: function (message) {
            var id = dialogContext.unconfirmedMessages.length;
            message.dateOfSending = new Date();
            message.status = -1;
            message.bindId = id;
            _api.sendDialogMessage(message, (result) => {
                var info = JSON.parse(result.data);
                var confirmedMessage = dialogContext.unconfirmedMessages[info.bindId];
                confirmedMessage.id = info.id;
                confirmedMessage.element.id = info.id;
                confirmedMessage.statusDiv.style.backgroundImage = "url(/images/delivered.png)";
                unconfirmedMessages[info.bindId] = undefined;
            });
            dialogContext.unconfirmedMessages.push(message);
            dialogContext.addNewMessage(message);
        },

        uploadUnreadedMessages: uploadUnreadedMessages,

        uploadReadedMessages: uploadUnreadedMessages
    };
})();

var dialogGuiModule = (function () {
    var _date;
    var dialogTitleDiv;
    var dialogStatusDiv;

    return {
        init: function (dateModule) {
            _date = dateModule;
            dialogTitleDiv = document.getElementById("conversationTitle");
            dialogStatusDiv = document.getElementById("conversationStatus");
        },

        createDialogDiv: function (dialog) {
            var element = document.createElement("div");
            element.classList.add("conversation");
            element.id = dialog.id;
            var photoDiv = document.createElement("div");
            photoDiv.classList.add("conversationPhoto");
            photoDiv.style.backgroundImage = "url('/images/" + dialog.image + "')";
            var convPreview = document.createElement("div");
            convPreview.classList.add("conversationPreview");
            var convTitle = document.createElement("div");
            convTitle.classList.add("conversationTitle");
            convTitle.innerText = dialog.title;
            var convMessage = document.createElement("div");
            convMessage.classList.add("conversationMessage");
            var convText = document.createElement("div");
            convText.classList.add("conversationText");
            convText.innerText = dialog.lastMessageText !== null ? dialog.lastMessageText : "";
            var convDate = document.createElement("div");
            convDate.classList.add("conversationDate");
            convDate.innerText = dialog.lastMessageDate !== null ? _date.getDate(new Date(dialog.lastMessageDate)) : "";
            convMessage.appendChild(convText);
            convMessage.appendChild(convDate);
            convPreview.appendChild(convTitle);
            convPreview.appendChild(convMessage);
            element.appendChild(photoDiv);
            element.appendChild(convPreview);
            return element;
        },

        getDialogTitleDiv: function () { return dialogTitleDiv; },
        getDialogStatusDiv: function () { return dialogStatusDiv; },
        getMessageBox: function () { },
        getSendMessageBtn: function () { },

        setDialog: function (title, status) {
            dialogTitleDiv.innerText = title;
            dialogStatusDiv.innerText = status;
        }
    };
})();