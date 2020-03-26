﻿var userModule = (function () {
    var _api;
    var _guiManager;  
    var prevSearch;   

    var getUserInfo = function (userId) {
        _api.getUserInfo(userId, function (userInfo) {
            _guiManager.setUserInfo(userInfo);                       
        });
    };

    var createUserFoundElement = function (user) {
        var box = document.createElement("div");
        box.classList.add("userPreviewInner");
        box.onclick = function () { getUserInfo(user.id); };
        var imageBox = document.createElement("div");
        imageBox.style.backgroundImage = "url('/images/" + user.miniAvatar + "')";
        imageBox.classList.add("userPreviewAvatar");
        box.appendChild(imageBox);
        var nicknameBox = document.createElement("div");
        nicknameBox.textContent = user.nickname;
        nicknameBox.classList.add("userPreviewNickname");
        box.appendChild(nicknameBox);
        box.id = user.userId;
        return box;        
    };

    var findUserByNickname = function () {
        var nickname = _guiManager.getUserFindValue();
        if (nickname !== prevSearch) {
            _api.findByNickname(nickname, function (users) {
                _guiManager.clearUserResultsInnner();
                if (users.length > 0) {
                    for (var i = 0; i < users.length; i++) {
                        _guiManager.appendUserFound(createUserFoundElement(users[i]));
                    }
                } else {
                    _guiManager.setAsNotFound();
                }
            });
        }
        prevSearch = nickname;
    };

    return {
        init: function (api, guiManager) {
            _api = api;
            _guiManager = guiManager;
            _guiManager.setFindUserFunc(findUserByNickname);            
        },

        findUserByNickname: findUserByNickname
    };
})();

var userGuiModule = (function () {
    var userFindTextBox;
    var userResultsInner;
    var findUserBtn;
    var userInfoPanel;
    var userInfoNicknameBox;
    var userInfoAvatarBox;
    var userInfoStatusBox;
    var userInfoOnlineStatusBox;
    var userInfoOpenDialog;
    var closeUserInfoBtn;
    var dark;    

    var closeUserInfo = function () {
        dark.style.display = "none";
        userInfoPanel.style.display = "none";
    };    

    return {
        init: function () {
            userFindTextBox = document.getElementById("findUserValue");
            userResultsInner = document.getElementById("findUserResults");
            findUserBtn = document.getElementById("findUserButton");
            userInfoPanel = document.getElementById("userFullInfoPanel");
            userInfoNicknameBox = document.getElementById("userInfoNickname");
            userInfoAvatarBox = document.getElementById("userInfoAvatar");
            userInfoStatusBox = document.getElementById("userInfoStatus");
            userInfoOnlineStatusBox = document.getElementById("userInfoOnlineStatus");
            userInfoOpenDialog = document.getElementById("userInfoOpenDialog");
            closeUserInfoBtn = document.getElementById("closeUserInfo");
            closeUserInfoBtn.onclick = function () { closeUserInfo(); };
            dark = document.getElementById("dark");
        },

        //getUserFindValue: function () { return userFindTextBox.value; },
        //getUserResultsInner: function () { return userResultsInner; },
        //getFindUserBtn: function () { return findUserBtn; },
        //getUserInfoPanel: function () { return userInfoPanel; },
        //getUserInfoNicknameBox: function () { return userInfoNicknameBox; },
        //getUserInfoAvatarBox: function () { return userInfoAvatarBox; },
        //getUserInfoStatusBox: function () { return userInfoStatusBox; },
        //getUserInfoOnlineStatusBox: function () { return userInfoOnlineStatusBox; },
        //getUserInfoOpenDialog: function () { return userInfoOpenDialog; },

        clearUserResultsInnner: function () {
            while (userResultsInner.lastChild) {
                userResultsInner.removeChild(userResultsInner.lastChild);
            }
        },

        appendUserFound: function (element) {
            userResultsInner.appendChild(element);
        },

        setAsNotFound: function () { userResultsInner.innerText = "Не найдено"; },          

        setFindUserFunc: function (findFunc) {
            findUserBtn.onclick = findFunc;
            userFindTextBox.onkeydown = function (e) {
                if (e.keyCode === 13) {
                    findFunc();
                    return false;
                }
            };
        },        

        setUserInfo: function (userInfo) {
            userInfoAvatarBox.style.backgroundImage = "url('/images/" + userInfo.avatar + "')";
            userInfoNicknameBox.innerText = userInfo.nickname;
            userInfoStatusBox.innerText = userInfo.status;
            userInfoOnlineStatusBox.innerText = userInfo.onlineStatus ? "online" : "offline";
            dark.style.display = "block";
            userInfoPanel.style.display = "block";
        }

        //setOpenDialogFunc: function (openDialogFunc) {
        //    userInfoOpenDialog.onclick = function () {
        //        openDialogFunc();
        //        dark.style.display = "none";
        //        userInfoPanel.style.display = "none";
        //    };
        //}
    };
})();