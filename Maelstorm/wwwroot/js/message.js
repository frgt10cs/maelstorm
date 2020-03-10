// Взаимодейсвтие с сообщениями
var messageBox = document.getElementById("mesInput");
var mesSendBut = document.getElementById("mesSendBut");
var currentDate = new Date();
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sem", "Okt", "Nov", "Dec"];

function CheckUnreadedMessageForRead(dialogId) {
    var conv = GetDialogById(dialogId);
    for (var i = 0; i < conv.unreadedMessages.length; i++) {
        if (InIntoView(conv.messagesPanel, conv.unreadedMessages[i].element)) {
            console.log("readed: " + conv.unreadedMessages[i].text);
            conv.messages.push(conv.unreadedMessages[i]);
            // UpdateMessageStatus(conv.unreadedMessages[i]);
            conv.unreadedMessages.splice(i, 1);
        }
    }
}

// nezavisimo
function InIntoView(inner, element) {
    var elementTop = element.offsetTop,
        elementBottom = elementTop + element.offsetHeight,
        parentTop = inner.offsetTop + inner.scrollTop,
        parentBottom = parentTop + inner.offsetHeight;
    return elementTop > parentTop && elementBottom < parentBottom;
}

class Message {    
    constructor(id, dialogId, authorId, text, replyId, status, dateOfSending, bindId = -1) {
        this.id = id;
        this.dialogId = dialogId;
        this.authorId = authorId;
        this.text = this.SetText(text);
        this.replyId = replyId;
        this.status = status;
        this.dateOfSending = dateOfSending;
        this.bindId = bindId;               
    }    

    CreateMessageElement(isFromOther) {
        var mesBlock = document.createElement("div");
        mesBlock.classList.add("messageBlock");
        mesBlock.id = this.id;
        var messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        var messageText = document.createElement("div");
        messageText.innerText = this.text;
        messageDiv.appendChild(messageText);
        if (!isFromOther) {
            var statusDiv = document.createElement("div");
            statusDiv.classList.add("status");
            messageDiv.appendChild(statusDiv);
            message.statusDiv = statusDiv;
            mesBlock.classList.add("authMes");
            this.UpdateMessageStatus();
        }
        mesBlock.appendChild(messageDiv);
        this.element = mesBlock;
    }

    SetText(text) {
        if (!isEmptyOrSpaces(text)) {
            text = text.trim();
            text = text.replace(/\s\s+/g, ' ');
            this.text = text;
        }
    }

    SetAsDelivered() {

    }

    SetAsReaded() {

    }

    UpdateMessageStatus() {
        switch (this.status) {
            case -1:
                this.statusDiv.style.backgroundImage = "url(/images/notConfirmed.png)";
                break;
            case 0:
                this.statusDiv.style.backgroundImage = "url(/images/delivered.png)";
                break;
            case 1:
                this.statusDiv.style.backgroundImage = "url(/images/readed.png)";
                break;
        }
    }

    GetDate(date) {
        var dateString = "";
        if (date.toDateString() !== currentDate.toDateString()) {
            if (date === currentDate.getDate() - 1) {
                dateString = "Tomorrow";
            } else {
                dateString = months[date.getMonth()] + " " + date.getDate();
                if (date.getFullYear() !== currentDate.getFullYear()) {
                    dateString += " " + date.getFullYear();
                }
            }
        } else {
            var minutes = date.getMinutes().toString();
            dateString = date.getHours() + ":" + (minutes.length === 2 ? minutes : "0" + minutes);
        }
        return dateString;
    }
}