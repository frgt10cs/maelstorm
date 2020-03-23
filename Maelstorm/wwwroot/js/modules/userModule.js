var userModule = (function () {
    var _api;
    var _guiManager;  
    var prevSearch;

    return {
        init: function (api, guiManager) {
            _api = api;
            _guiManager = guiManager;
            _guiManager.getFindUserBtn().onclick = function () { findUserByNickname(); };
            _guiManager.getUserFindInput.onkeydown = function (e) {
                if (e.keyCode === 13) {
                    findUserByNickname();
                    return false;
                }
            };
        },

        findUserByNickname: function () {
            var nickname = _guiManager.getUserFindValue();
            if (nickname !== prevSearch) {
                _api.findByNickname(nickname, function (users) {
                    _guiManager.clearUserResultsInnner();
                    if (users.length > 0) {
                        for (var i = 0; i < users.length; i++) {
                            appendUserFound(users[i]);
                        }
                    } else {
                        _guiManager.setNotFound();   
                    }
                });
            }
            prevSearch = nickname;
        }
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
            closeUserInfo.onclick = function () { closeUserInfo(); };
            dark = document.getElementById("dark");
        },

        getUserFindValue: function () { return userFindTextBox.value; },
        getUserResultsInner: function () { return userResultsInner; },
        getFindUserBtn: function () { return findUserBtn; },
        getUserInfoPanel: function () { return userInfoPanel; },
        getUserInfoNicknameBox: function () { return userInfoNicknameBox; },
        getUserInfoAvatarBox: function () { return userInfoAvatarBox; },
        getUserInfoStatusBox: function () { return userInfoStatusBox; },
        getUserInfoOnlineStatusBox: function () { return userInfoOnlineStatusBox; },
        getUserInfoOpenDialog: function () { return userInfoOpenDialog; },

        clearUserResultsInnner: function () {
            while (userResultsInner.lastChild) {
                userResultsInner.removeChild(userResultsInner.lastChild);
            }
        },

        setNotFound: function () { userResultsInner.innerText = "Не найдено"; }        
    };
})();