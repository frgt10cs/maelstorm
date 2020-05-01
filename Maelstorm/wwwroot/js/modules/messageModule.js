/**
 * 
 * Operations with dialog messages
 *
 **/

let messageModule = (function () {           

    let setElement = function (message, isFromOther) {
        let mesBlock = document.createElement("div");
        mesBlock.className = "messageContainer mt-2 overflow-hidden";
        mesBlock.id = message.id;

        let messageDiv = document.createElement("div");
        messageDiv.className = "message text-white px-2 py-1 mw-75 rounded d-inline-block float-right bg-dark-6";

        let messageText = document.createElement("div");
        message.className = "messageText text-break";
        messageText.innerText = message.text;

        messageDiv.appendChild(messageText);
        if (!isFromOther) {
            let statusDiv = document.createElement("div");
            statusDiv.className = "messageStatus float-right";
            messageDiv.appendChild(statusDiv);
            message.statusDiv = statusDiv;
            messageDiv.classList.add("float-right");
            updateStatus(message);
        }
        mesBlock.appendChild(messageDiv);
        message.element = mesBlock;
    };

    let setStatus = function (message, status) {
        message.status = status;
        updateStatus(message);
    };

    let updateStatus = function (message) {        
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

    let validText = function (text) {
        if (!isEmptyOrSpaces(text)) {
            text = text.trim();
            text = text.replace(/\s\s+/g, ' ');
            return text;
        }
        return "";
    }    

    let isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
    };

    return {

        init: function () {
        
        },
               
        setElement: setElement,        
        setStatus: setStatus,
        updateStatus: updateStatus,
        validText: validText
    };
})();