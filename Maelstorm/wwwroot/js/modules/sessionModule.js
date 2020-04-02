﻿var sessionModule = (function () {
    var _api;
    var _guiManager;        

    var closeSession = function (sessionId) {
        _api.closeSession(sessionId, false);        
    };

    var banSession = function (sessionId) {
        _api.closeSession(sessionId, true);
    };

    var uploadSessions = function () {
        _api.getSessions(function (sessions) {
            _guiManager.clearSessionsContainer();
            for (var i = 0; i < sessions.length; i++) {
                _guiManager.appendSession(createSessionDiv(sessions[i]));
            }
        });
    };

    var createElement = function (element, className = "", inner = "") {
        var newElement = document.createElement(element);
        newElement.classList.add(className);
        newElement.innerText = inner;
        return newElement;
    };

    var createSessionDiv = function (session) {
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
            opened = createElement("div", "moreField", "Opened at: " + dateString),
            ip = createElement("div", "moreField", "Ip: " + session.session.ipAddress),
            isOnline = createElement("div", "moreField", "Status: " + (session.signalRSession === null ? "offline" : "online")),
            buttons = createElement("div", "sessionButtons"),
            closeSessionBtn = createElement("button", "sessionButton", "Close"),
            banDeviceBtn = createElement("button", "sessionButton", "Ban device");
        more.onclick = function () { $(moreContainer).slideToggle("fast"); };
        closeSessionBtn.onclick = function () {
            closeSession(session.session.sessionId);
            container.style.opacity = "0.6";
            moreContainer.removeChild(buttons);
        };
        banDeviceBtn.onclick = function () { banSession(session.session.sessionId); };
        imageBox.style.backgroundImage = "url('/images/" + session.session.osCpu + ".png')";
        info.appendChild(title);
        info.appendChild(date);
        info.appendChild(more);
        mainInfo.appendChild(imageBox);
        mainInfo.appendChild(info);
        buttons.appendChild(closeSessionBtn);
        buttons.appendChild(banDeviceBtn);
        moreContainer.appendChild(opened);
        moreContainer.appendChild(ip);
        moreContainer.appendChild(isOnline);
        moreContainer.appendChild(buttons);
        container.appendChild(mainInfo);
        container.appendChild(moreContainer);
        return container;
    };

    return {
        init: function (api, guiManager) {
            _api = api;
            _guiManager = guiManager;
            _guiManager.setLoadSessionsFunc(uploadSessions);            
        },

        uploadSessions: uploadSessions,                    
        closeSession: closeSession,
        banDevice: banSession
    };
})();

var sessionGuiModule = (function () {
    var sessionsContainer;
    var loadSessionsBtn;    

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

        clearSessionsContainer: clearSessionsContainer,

        appendSession: function (element) { sessionsContainer.appendChild(element); },        
        
        setLoadSessionsFunc: function (loadFunc) { loadSessionsBtn.onclick = loadFunc; }
    };
})();