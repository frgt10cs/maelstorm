let userModule = (function () {    
    let prevSearch;      

    let createUserFoundElement = function (user) {
        let box = document.createElement("div");
        box.id = "f_" + user.id;
        box.className = "userPreviewInner col-12 col-sm-6 col-md-4 col-lg-3";
        box.onclick = function () {
            dialogsModule.openOrCreateDialog(Number(box.id.split('_')[1]));
            userGuiModule.hideUsersPanel(); 
        };
        let imageBox = document.createElement("div");
        imageBox.style.backgroundImage = "url('/images/" + user.miniAvatar + "')";
        imageBox.classList.add("userPreviewAvatar");
        box.appendChild(imageBox);
        let rightBox = document.createElement("div");
        rightBox.className = "d-flex justify-content-between flex-column pl-1 overflow-hidden";
        let nicknameBox = document.createElement("div");
        nicknameBox.textContent = user.nickname;
        nicknameBox.className = "userPreviewNickname text-truncate";
        if (user.isOnline) nicknameBox.classList.add("text-success");
        let statusBox = document.createElement("div");
        statusBox.innerHTML = user.status;
        statusBox.className = "userPreviewStatus text-truncate";
        rightBox.appendChild(nicknameBox);
        rightBox.appendChild(statusBox);
        box.appendChild(rightBox);        
        return box;        
    };

    let findUserByLogin = async function () {        
        let login = userGuiModule.getUserFindValue();        
        if (login !== prevSearch) {
            let users = await api.finsUserByLogin(login);
            userGuiModule.clearUserResultsInnner();
            if (users.length > 0) {
                for (let i = 0; i < users.length; i++) {
                    userGuiModule.appendUserFound(createUserFoundElement(users[i]));
                }
            } else {
                userGuiModule.setAsNotFound();
            }
            prevSearch = login;
        }        
    };

    return {
        init: function () {   
            userGuiModule.init();
            userGuiModule.setFindUserFunc(findUserByNickname);           
        },

        findUserByLogin: findUserByLogin
    };
})();

let userGuiModule = (function () {
    let usersPanel;
    let userFindTextBox;
    let userResultsInner;        
    var isSearchBlocked = false;  
    let equalsRadio;

    closeUserInfo = function () {
        layoutGuiModule.hideDark();
        userInfoPanel.style.display = "none";
    };  

    return {
        init: function () {
            userFindTextBox = document.getElementById("findUserValue");
            userResultsInner = document.getElementById("findUserResults");                       
            usersPanel = document.getElementById("usersPanel");
            equalsRadio = document.getElementById("equalsRadioSearch");
        },

        getUserFindValue: function () { return userFindTextBox.value; },                      

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

        setAsNotFound: function () { userResultsInner.innerText = "No matches"; },          

        setFindUserFunc: function (findFuncAsync) {
            userFindTextBox.onkeydown = async function (e) {
                if (e.keyCode === 13 && !isSearchBlocked) {
                    isSearchBlocked = true;
                    await findFuncAsync();
                    isSearchBlocked = false;
                    return false;
                }
            };
        }
    };
})();