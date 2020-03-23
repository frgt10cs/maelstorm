var sessionModule = (function () {
    var _api;
    var _guiManager;

    return {
        init: function (api, guiManager) {
            _api = api;
            _guiManager = guiManager;
            _guiManager.getLoadSessionsBtn().onclick = function () { uploadSessions(); }
        },

        uploadSessions: function () {            
            _api.getSessions(function (sessions) {
                _guiManager.clearSessionsContainer();
                for (var i = 0; i < sessions.length; i++) {
                    var id = sessions[i].session.sessionId;
                    _guiManager.appendSession(sessions[i],
                        _api.closeSession(id, false),
                        _api.closeSession(id, true));
                }
            });
        }
    };
})();

var sessionGuimodule = (function () {
    var sessionsContainer;
    var loadSessionsBtn; 

    var createElement = function (element, className = "", inner = "") {
        var newElement = document.createElement(element);
        newElement.classList.add(className);
        newElement.innerText = inner;
        return newElement;
    };

    var createSessionDiv = function (session, close, ban) {
        var sessionDate = new Date(session.session.createdAt);
        var dateString = sessionDate.getDate() + "." + (sessionDate.getMonth() + 1) + "." + sessionDate.getFullYear();
        var container = createElement("div", "sessionContainer"),
            imageBox = createElement("div", "sessionImage"),
            mainInfo = createElement("div", "sessionMainInfo"),
            info = createElement("div", "sessionInfo"),
            title = createElement("div", "sessionTitle", session.session.location + " · " + session.session.osCpu),
            date = createElement("div", "sessionDate", dateString + " · " + session.session.app),
            more = createElement("div", "sessionMore", "More"),
            moreContainer = createElement("div", "sessionMoreContainer"),
            opened = createElement("div", "moreField", "Opened at: " + datestring),
            ip = createElement("div", "moreField", "Ip: " + session.session.ipAddress),
            isOnline = createElement("div", "moreField", "Status: " + (session.signalRSession === null ? "offline" : "online")),
            buttons = createElement("div", "sessionButtons"),
            closeSessionBtn = createElement("button", "sessionButton", "Close"),
            banDevice = createElement("button", "sessionButton", "Ban device");
        more.onclick = function () { $(moreContainer).slideToggle("fast"); };
        closeSessionBtn.onclick = function () { close(); };
        banSessionBtn.onclick = function () { ban(); };
        imageBox.style.backgroundImage = "url('/images/" + session.session.osCpu + ".png')";
        info.appendChild(title);
        info.appendChild(date);
        info.appendChild(more);
        mainInfo.appendChild(imageBox);
        mainInfo.appendChild(info);
        buttons.appendChild(closeSessionBtn);
        buttons.appendChild(banDevice);
        moreContainer.appendChild(opened);
        moreContainer.appendChild(ip);
        moreContainer.appendChild(isOnline);
        moreContainer.appendChild(buttons);
        container.appendChild(mainInfo);
        container.appendChild(moreContainer);
        return container;
    };

    var clearSessionsContainer = function () {
        while (sessionsContainer.firstChild) {
            sessionsContainer.removeChild(sessionsContainer.firstChild);
        }
    };

    return {
        init: function () {
            sessionsContainer = document.getElementById("sessionsContainer");
            loadSessionsBtn = document.getElementById("loadSessions");
        },

        appendSession: function (session, close, ban) {
            var div = createSessionDiv(sessions[i], close, ban);
            sessionsContainer.appendChild(div);
        },

        getLoadSessionsBtn: function () { return loadSessionsBtn; },
        getSessionsContainer: function () { return sessionsContainer; }        
    };
})();