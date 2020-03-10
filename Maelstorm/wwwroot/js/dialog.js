// depends on api (getmessages)
class Dialog {
    constructor(serverDialog) {  
        this.id = serverDialog.id;
        this.title = serverDialog.title;
        this.lastMessageText = serverDialog.lastMessageText;
        this.lastMessageDate = serverDialog.lastMessageDate;
        this.image = serverDialog.image;
        this.interlocutorId = serverDialog.interlocutorId;
        this.isPanelOpened = false;
        this.unreadedMessages = [];
        this.messages = [];
        this.unconfirmedMessages = [];
        this.readedMessagesOffset = 0;
        this.allReadedUploaded = false;
        this.allUnreadedUploaded = false;
        this.messagesPanel = this.CreateMessagesPanel();        
        this.element = this.CreateDialogDiv(this);
        this.uploadingBlocked = false;
    }

    CreateMessagesPanel() {
        var element = document.createElement("div");
        element.classList.add("conversationMessages");
        element.style.display = "none";
        element.onscroll = function () {
            this.OnMessagesPanelScroll();
        };        
        return element;
    }

    // this = scroll?
    OnMessagesPanelScroll() {
        if (!this.uploadingBlocked) {
            if (this.messagesPanel.scrollTop < 10 && !this.allReadedUpload) {
                console.log("old upl");
                this.uploadingBlocked = true;
                this.UploadReadedMessages();
            }
            else if (this.messagesPanel.scrollHeight - this.messagesPanel.scrollTop - this.messagesPanel.offsetHeight < 10
                && !this.allUnreadedUpload && this.unreadedMessages.length === 0) {
                console.log("new upl");
                this.uploadingBlocked = true;
                this.UploadUnreadedMessages();
            }
        }
    }

    Open() {
        this.isPanelOpened = true;
        this.messagesPanel.style.display = "block";
    }

    Close() {
        this.messagesPanel.style.display = "none";
    }

    SendMessage(message) {
        var id = this.unconfirmedMessages.length;        
        message.dateOfSending = new Date();        
        message.status = -1;
        message.bindId = id;
        SendDialogMessage(message, (result) => {
            var info = JSON.parse(result.data);
            var confirmedMessage = unconfirmedMessages[info.bindId];
            confirmedMessage.id = info.id;
            confirmedMessage.element.id = info.id;
            confirmedMessage.statusDiv.style.backgroundImage = "url(/images/delivered.png)";
            unconfirmedMessages[info.bindId] = undefined;
        });
        unconfirmedMessages.push(message);        
        this.AddNewMessage(message);
    }   

    UnreadedMessagesHandler(messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < uploadMessagesCount) this.allUnreadedUpload = true;
            for (var i = 0; i < messages.length; i++) {
                this.AppendMessageToEnd(messages[i]);
                this.unreadedMessages.push(messages[i]);
            }
        }
        else {
            this.allUnreadedUpload = true;
        }
        this.uploadingBlocked = false;
    }

    ReadedMessagesHandler(messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < uploadMessagesCount) this.allReadedUpload = true;
            this.readedMessagesOffset += messages.length;
            var resultScrollTop = 0;
            for (var i = 0; i < messages.length; i++) {
                this.AppendMessageToBegin(messages[i]);
                this.messages.unshift(messages[i]);
                resultScrollTop += messages[i].element.offsetHeight;
            }
            this.messagesPanel.scrollTop = resultScrollTop;
        }
        else {
            this.allReadedUpload = true;
        }
        this.uploadingBlocked = false;
    }

    FirstMessagesUpload() {
        //$.when($.ajax(UploadOldMessages(dialog)).then(function () {
        //    UploadNewMessages(dialog);      
        //}));
        this.UploadReadedMessages();
    }

    UploadReadedMessages() {
        GetReadedMessages(dialog.id, dialog.readedMessagesOffset, uploadMessagesCount, this.ReadedMessagesHandler);
    }

    UploadUnreadedMessages() {
        GetUnreadedMessages(dialog.id, uploadMessagesCount, this.UnreadedMessagesHandler);
    }

    AddNewMessage(message) {
        if (this.isPanelOpened) {
            this.AppendMessageToEnd(message);
            var isFromOther = message.authorId === this.interlocutorId;
            message.CreateMessageElement(isFromOther);
            if (isFromOther) {                
                dialog.unreadedMessages.push(message);
            } else {                
                dialog.messages.push(message);
                dialog.readedMessagesOffset++;
            }
        }     
        var preView = dialog.element.lastElementChild.lastElementChild;
        preView.firstElementChild.innerText = message.text;
        preView.lastElementChild.innerText = GetDate(new Date(message.dateOfSending));
        dialogsContainer.insertBefore(dialog.element, dialogsContainer.firstChild);// !
    }

    AppendMessageToBegin(message) {        
        this.messagesPanel.prepend(message.element);
    }

    AppendMessageToEnd(message) {        
        this.messagesPanel.appendChild(message.element);
    }
}