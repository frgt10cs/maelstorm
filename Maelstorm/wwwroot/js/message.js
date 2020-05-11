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