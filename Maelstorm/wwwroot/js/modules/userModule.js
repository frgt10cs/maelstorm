let userModule = (function () {    
    let prevSearch;
    let openedUserInfo;   

    let getUserInfo = async function (userId) {
        var userInfo = await api.getUserInfo(userId);
        openedUserInfo = userInfo;
        userGuiModule.setUserInfo(userInfo);
        userGuiModule.showUserInfo();     
    };

    let createUserFoundElement = function (user) {
        let box = document.createElement("div");
        box.classList.add("userPreviewInner");
        box.onclick = function () {
            getUserInfo(user.id);            
        };
        let imageBox = document.createElement("div");
        imageBox.style.backgroundImage = "url('/images/" + user.miniAvatar + "')";
        imageBox.classList.add("userPreviewAvatar");
        box.appendChild(imageBox);
        let nicknameBox = document.createElement("div");
        nicknameBox.textContent = user.nickname;
        nicknameBox.classList.add("userPreviewNickname");
        box.appendChild(nicknameBox);
        box.id = user.userId;
        return box;        
    };

    let findUserByNickname = async function () {
        userGuiModule.get
        let nickname = userGuiModule.getUserFindValue();
        if (nickname !== prevSearch) {
            let users = await api.findByNickname(nickname);
            userGuiModule.clearUserResultsInnner();
            if (users.length > 0) {
                for (let i = 0; i < users.length; i++) {
                    userGuiModule.appendUserFound(createUserFoundElement(users[i]));
                }
            } else {
                userGuiModule.setAsNotFound();
            }
            prevSearch = nickname;
        }        
    };

    return {
        init: function () {   
            userGuiModule.init();
            userGuiModule.setFindUserFunc(findUserByNickname);
            userGuiModule.getUserInfoOpenDialog().onclick = function () {
                dialogsModule.openOrCreateDialog(openedUserInfo);
                userGuiModule.closeUserInfo();
            };
        },

        findUserByNickname: findUserByNickname
    };
})();

let userGuiModule = (function () {
    let usersPanel;
    let userFindTextBox;
    let userResultsInner;    
    let userInfoPanel;
    let userInfoNicknameBox;
    let userInfoAvatarBox;
    let userInfoStatusBox;
    let userInfoOnlineStatusBox;
    let userInfoOpenDialog;
    let closeUserInfoBtn;
    var isSearchBlocked = false;   

    closeUserInfo = function () {
        layoutGuiModule.hideDark();
        userInfoPanel.style.display = "none";
    };  

    return {
        init: function () {
            userFindTextBox = document.getElementById("findUserValue");
            userResultsInner = document.getElementById("findUserResults");            
            userInfoPanel = document.getElementById("userFullInfoPanel");
            userInfoNicknameBox = document.getElementById("userInfoNickname");
            userInfoAvatarBox = document.getElementById("userInfoAvatar");
            userInfoStatusBox = document.getElementById("userInfoStatus");
            userInfoOnlineStatusBox = document.getElementById("userInfoOnlineStatus");
            userInfoOpenDialog = document.getElementById("userInfoOpenDialog");
            closeUserInfoBtn = document.getElementById("closeUserInfo");
            usersPanel = document.getElementById("usersPanel");
            closeUserInfoBtn.onclick = closeUserInfo;
        },

        getUserFindValue: function () { return userFindTextBox.value; },
        //getUserResultsInner: function () { return userResultsInner; },
        //getFindUserBtn: function () { return findUserBtn; },
        //getUserInfoPanel: function () { return userInfoPanel; },
        //getUserInfoNicknameBox: function () { return userInfoNicknameBox; },
        //getUserInfoAvatarBox: function () { return userInfoAvatarBox; },
        //getUserInfoStatusBox: function () { return userInfoStatusBox; },
        //getUserInfoOnlineStatusBox: function () { return userInfoOnlineStatusBox; },
        getUserInfoOpenDialog: function () { return userInfoOpenDialog; },        

        openUsersPanel: function () {
            usersPanel.style.display = "block";
            layoutGuiModule.showDark();
        },

        hideUsersPanel: function(){
            usersPanel.style.display = "none";
            layoutGuiModule.hideDark();
        },

        clearUserResultsInnner: function () {
            while (userResultsInner.lastChild) {
                userResultsInner.removeChild(userResultsInner.lastChild);
            }
        },

        appendUserFound: function (element) {
            userResultsInner.appendChild(element);
        },

        setAsNotFound: function () { userResultsInner.innerText = "Не найдено"; },          

        setFindUserFunc: function (findFuncAsync) {
            userFindTextBox.onkeydown = async function (e) {
                if (e.keyCode === 13 && !isSearchBlocked) {
                    isSearchBlocked = true;
                    await findFuncAsync();
                    isSearchBlocked = false;
                    return false;
                }
            };
        },        

        setUserInfo: function (userInfo) {
            userInfoAvatarBox.style.backgroundImage = "url('/images/" + userInfo.avatar + "')";
            userInfoNicknameBox.innerText = userInfo.nickname;
            userInfoStatusBox.innerText = userInfo.status;
            userInfoOnlineStatusBox.innerText = userInfo.onlineStatus ? "online" : "offline";            
        },

        showUserInfo: function () {
            layoutGuiModule.showDark();
            userInfoPanel.style.display = "block";
        },

        closeUserInfo: closeUserInfo
    };
})();