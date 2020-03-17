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
        this.uploadingBlocked = false;
        this.uploadCount = 20;
        this.messagesPanel = this.createMessagesPanel();        
    }

    openDialog() {
        if (!this.isPanelOpened) {
            this.firstDialogMessagesUploading();
        }
        this.isPanelOpened = true;
        this.messagesPanel.style.display = "block";
    }

    addNewMessage(message) {
        if (this.isPanelOpened) {
            this.appendMessageToEnd(message);
            var isFromOther = message.authorId === dialog.interlocutorId;
            message.CreateMessageElement(isFromOther);
            if (isFromOther) {
                this.unreadedMessages.push(message);
            } else {
                this.messages.push(message);
                this.readedMessagesOffset++;
            }
        }
        var preView = this.element.lastElementChild.lastElementChild;
        preView.firstElementChild.innerText = message.text;
        preView.lastElementChild.innerText = GetDate(new Date(message.dateOfSending));        
    }

    appendMessageToBegin(message) {
        this.messagesPanel.prepend(message.element);
    }

    appendMessageToEnd(message) {
        this.messagesPanel.appendChild(message.element);
    }       
}