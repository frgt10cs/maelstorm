var messageModule = (function () {           

    var setElement = function (message, isFromOther) {
        var mesBlock = document.createElement("div");
        mesBlock.className = "messageContainer mt-2 overflow-hidden";
        mesBlock.id = message.id;

        var messageDiv = document.createElement("div");
        messageDiv.className = "message text-white px-2 py-1 mw-75 rounded d-inline-block float-right bg-dark-6";

        var messageText = document.createElement("div");
        message.className = "messageText text-break";
        messageText.innerText = message.text;

        messageDiv.appendChild(messageText);
        if (!isFromOther) {
            var statusDiv = document.createElement("div");
            statusDiv.className = "messageStatus float-right";
            messageDiv.appendChild(statusDiv);
            message.statusDiv = statusDiv;
            messageDiv.classList.add("float-right");
            updateStatus(message);
        }
        mesBlock.appendChild(messageDiv);
        message.element = mesBlock;
    };

    var setStatus = function (message, status) {
        message.status = status;
        updateStatus(message);
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

    // more
    var setText = function (message, text) {
        if (!isEmptyOrSpaces(text)) {
            text = text.trim();
            text = text.replace(/\s\s+/g, ' ');
            message.text = text;
        }
    };

    var isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
    };

    return {

        init: function () {
        
        },
               
        setElement: setElement,        
        setStatus: setStatus,
        updateStatus: updateStatus,
        setText: setText
    };
})();