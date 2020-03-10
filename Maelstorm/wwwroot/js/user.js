var userFindInput = document.getElementById("findUserValue");
var userResultsInner = document.getElementById("findUserResults");
var findUserButton = document.getElementById("findUserButton");
var prevRequest = "";

function FindUserByNickname() {
    var value = userFindInput.value;
    if (prevRequest !== value) {
        SendRequest(new MaelstormRequest("/api/finder/finduser?nickname=" + value,
            function(data) {
                while (userResultsInner.lastChild) {
                    userResultsInner.removeChild(userResultsInner.lastChild);
                }
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        AppendUserFound(data[i]);
                    }
                } else {
                    userResultsInner.innerText = "Не найдено";
                }
            }
        ));
        prevRequest = value;
    }
}

findUserButton.onclick = function() {
    FindUserByNickname();
};

userFindInput.onkeydown = function(e) {
    if (e.keyCode === 13) {
        FindUserByNickname();
        return false;
    }
};

var userInfoPanel = document.getElementById("userFullInfoPanel");
var userInfoNicknameBox = document.getElementById("userInfoNickname");
var userInfoAvatarBox = document.getElementById("userInfoAvatar");
var userInfoStatusBox = document.getElementById("userInfoStatus");
var userInfoOnlineStatusBox = document.getElementById("userInfoOnlineStatus");
var userInfoOpenDialog = document.getElementById("userInfoOpenDialog");
var dark = document.getElementById("dark");

function AppendUserFound(data) {
    var box = document.createElement("div");
    box.classList.add("userPreviewInner");
    box.onclick = function() {        
        SendRequest(new MaelstormRequest("/api/user/getuserinfo?userId=" + data.userId, function(userInfo) {
            console.log(userInfo);
            userInfoAvatarBox.style.backgroundImage = "url('/images/" + userInfo.avatar + "')";
            userInfoNicknameBox.innerText = userInfo.nickname;
            userInfoStatusBox.innerText = userInfo.status;
            userInfoOnlineStatusBox.innerText = userInfo.onlineStatus ? "online" : "offline";
            dark.style.display = "block";
            userInfoPanel.style.display = "block";
            userInfoOpenDialog.onclick = () => {
                if (IsDialogUploaded(userInfo.id)) {
                    OpenDialog(userInfo.id);
                } else {
                    GetDialog(userInfo.id, (dialog) => {
                        if (dialog !== null && dialog !== undefined) {
                            AddDialog(dialog);
                            OpenDialog(userInfo.id);
                        } else {
                            var newDialog = {
                                interlocutorId: userInfo.id,
                                title: userInfo.nickname,
                                lastMessageText: "",
                                lastMessageDate: "",
                                image: userInfo.avatar
                            };
                            AddDialog(newDialog);
                            OpenDialog(userInfo.id);
                        }
                    });
                }
                dark.style.display = "none";
                userInfoPanel.style.display = "none";
            };
        }));
    };
    var imageBox = document.createElement("div");
    imageBox.style.backgroundImage = "url('/images/" + data.miniAvatar + "')";
    imageBox.classList.add("userPreviewAvatar");
    box.appendChild(imageBox);
    var nicknameBox = document.createElement("div");
    nicknameBox.textContent = data.nickname;
    nicknameBox.classList.add("userPreviewNickname");
    box.appendChild(nicknameBox);
    box.id = data.userId;
    userResultsInner.appendChild(box);
}

function closeUserInfo() {
    dark.style.display = "none";
    userInfoPanel.style.display = "none";
}

document.getElementById("closeUserInfo").onclick = function() {
    closeUserInfo();
};

function CreateElement(element, className = "", inner = "") {
    var newElement = document.createElement(element);
    newElement.classList.add(className);
    newElement.innerText = inner
    return newElement;
}

function CreateSessionDiv(session) {
    var date = new Date(session.session.createdAt);
    var datestring = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    var container = CreateElement("div", "sessionContainer"),
        imageBox = CreateElement("div", "sessionImage"),
        mainInfo = CreateElement("div", "sessionMainInfo"),
        info = CreateElement("div", "sessionInfo"),
        title = CreateElement("div", "sessionTitle", session.session.location + " · " + session.session.osCpu),
        date = CreateElement("div", "sessionDate", datestring + " · " + session.session.app),
        more = CreateElement("div", "sessionMore", "More"),
        moreContainer = CreateElement("div", "sessionMoreContainer"),
        opened = CreateElement("div", "moreField", "Opened at: " + datestring),
        ip = CreateElement("div", "moreField", "Ip: " + session.session.ipAddress),
        isOnline = CreateElement("div", "moreField", "Status: " + (session.signalRSession === null ? "offline" : "online")),
        buttons = CreateElement("div", "sessionButtons"),
        closeSessionButton = CreateElement("button", "sessionButton", "Close"),
        banDevice = CreateElement("button", "sessionButton", "Ban device");
    closeSessionButton.onclick = function() {
        CloseSession(session.session.sessionId, false);
    };
    banDevice.onclick = function() {
        CloseSession(session.session.sessionId, true);
    };
    more.onclick = function() {
        $(moreContainer).slideToggle("fast");
    };
    imageBox.style.backgroundImage = "url('/images/" + session.session.osCpu + ".png')";
    info.appendChild(title);
    info.appendChild(date);
    info.appendChild(more);
    mainInfo.appendChild(imageBox);
    mainInfo.appendChild(info);
    buttons.appendChild(closeSessionButton);
    buttons.appendChild(banDevice);
    moreContainer.appendChild(opened);
    moreContainer.appendChild(ip);
    moreContainer.appendChild(isOnline);
    moreContainer.appendChild(buttons);
    container.appendChild(mainInfo);
    container.appendChild(moreContainer);
    return container;
}

var sessionsContainer = document.getElementById("sessionsContainer");
document.getElementById("loadSessions").onclick = function() {
    while (sessionsContainer.firstChild) {
        sessionsContainer.removeChild(sessionsContainer.firstChild);
    };
    GetSessions(function(sessions) {
        for (var i = 0; i < sessions.length; i++) {
            var div = CreateSessionDiv(sessions[i]);
            sessionsContainer.appendChild(div);
        }
    });
}