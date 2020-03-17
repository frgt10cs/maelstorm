var messageModule = (function () {
    var messageContext;
    var _guiModule;

    var createMessage = function (targetId) {
        var message;
        message.targetId = targetId;
        message.text = _guiModule.getMessageBox();
        return message;
    };

    var createMessageElement = function (message, isFromOther) {
        var mesBlock = document.createElement("div");
        mesBlock.classList.add("messageBlock");
        mesBlock.id = message.id;
        var messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        var messageText = document.createElement("div");
        messageText.innerText = message.text;
        messageDiv.appendChild(messageText);
        if (!isFromOther) {
            var statusDiv = document.createElement("div");
            statusDiv.classList.add("status");
            messageDiv.appendChild(statusDiv);
            message.statusDiv = statusDiv;
            mesBlock.classList.add("authMes");
            updateStatus(message);
        }
        mesBlock.appendChild(messageDiv);
        message.element = mesBlock;
    };

    var updateStatus = function (message) {
        switch (message.status) {
            case -1:
                message.statusDiv.style.backgroundImage = "url(/images/notConfirmed.png)";
                break;
            case 0:
                message.statusDiv.style.backgroundImage = "url(/images/delivered.png)";
                break;
            case 1:
                message.statusDiv.style.backgroundImage = "url(/images/readed.png)";
                break;
        }
    };

    return {

        init: function (guiModule) {
            _guiModule = guiModule;
        },

        setMessageContext: function (message) {
            messageContext = message;
        },

        createMessage: createMessage,
        createMessageElement: createMessageElement,

        createMessages: function (serverMessages) {
            var messages = [];
            for (var i = 0; i < serverMessages.length; i++) {
                messages.push(this.createMessage(messages[i]));
            }
            return messages;
        },

        updateStatus: updateStatus
    };
})();