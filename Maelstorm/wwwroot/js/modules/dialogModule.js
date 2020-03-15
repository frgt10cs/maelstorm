var dialogModule = (function () {
    var _api;
    var _uploadCount;
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
            if (thdialogContextis.messagesPanel.scrollTop < 10 && !dialogContext.allReadedUpload) {
                console.log("old upl");
                dialogContext.uploadingBlocked = true;
                uploadReadedMessages();
            }
            else if (dialogContext.messagesPanel.scrollHeight - dialogContext.messagesPanel.scrollTop - this.messagesPanel.offsetHeight < 10
                && !dialogContext.allUnreadedUpload && dialogContext.unreadedMessages.length === 0) {
                console.log("new upl");
                dialogContext.uploadingBlocked = true;
                uploadUnreadedMessages();
            }
        }
    };  

    var unreadedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allUnreadedUpload = true;
            for (var i = 0; i < messages.length; i++) {
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
        var dialog = {};
        dialog.id = serverDialog.id;
        dialog.title = serverDialog.title;
        dialog.lastMessageText = serverDialog.lastMessageText;
        dialog.lastMessageDate = serverDialog.lastMessageDate;
        dialog.image = serverDialog.image;
        dialog.interlocutorId = serverDialog.interlocutorId;
        dialog.isPanelOpened = false;
        dialog.unreadedMessages = [];
        dialog.messages = [];
        dialog.unconfirmedMessages = [];
        dialog.readedMessagesOffset = 0;
        dialog.allReadedUploaded = false;
        dialog.allUnreadedUploaded = false;
        dialog.uploadingBlocked = false;
        dialog.messagesPanel = createMessagesPanel();        
        return dialog;
    };

    var firstDialogMessagesUploading = function () {
        uploadReadedMessages();
    };

    return {

        init: function (api, dateModule, uploadCount, onNewMessageHandler) {
            _api = api;
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

        unreadedMessagesHandler: function(messages) {
            if (messages !== null && messages !== undefined && messages.length > 0) {
                if (messages.length < _uploadCount) dialogContext.allUnreadedUpload = true;
                for (var i = 0; i < messages.length; i++) {
                    appendMessageToEnd(messages[i]);
                    dialogContext.unreadedMessages.push(messages[i]);
                }
            }
            else {
                dialogContext.allUnreadedUpload = true;
            }
            dialogContext.uploadingBlocked = false;
        },

        readedMessagesHandler: function(messages) {
            if (messages !== null && messages !== undefined && messages.length > 0) {
                if (messages.length < _uploadCount) dialogContext.allReadedUpload = true;
                dialogContext.readedMessagesOffset += messages.length;
                var resultScrollTop = 0;
                for (var i = 0; i < messages.length; i++) {
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
        },  

        sendMessage: function (message) {
            var id = dialogContext.unconfirmedMessages.length;
            message.dateOfSending = new Date();
            message.status = -1;
            message.bindId = id;
            SendDialogMessage(message, (result) => {
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