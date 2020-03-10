var accountModule = (function () {
    var _api;
    var _guiManager;    

    var login = function () {
        if (_guiManager.getLoginForm().isDataValid()) {
            _api.login(_guiManager.getLoginForm().getLogin(), _guiManager.getLoginForm().getPassword(),
                () => {
                    _guiManager.onLogin();
                    _guiManager.hideAllForms();
                },
                () => {
                    onLoginFailed();
                    alert("Login failed");
                });
        }   
    };

    var registration = function () {
        if (_guiManager.regForm.isDataValid()) {
            _api.registration(_guiManager.regForm.login,
                _guiManager.getRegForm().getEmail(),
                _guiManager.getRegForm().getPassword(),
                _guiManager.getRegForm.getPasswordConfirm(),
                () => { onRegistration(); },
                (data) => { onRegistrationFailed(data); });
        }  
    };

    var logout = function () {
        _api.logOut();
        _guiManager.openLogin();
    };

    return {
        init: function (api, guiManager) {
            _api = api;
            _guiManager = guiManager;
            _guiManager.getLoginForm().getSubmitButton().onclick = login;
            _guiManager.getRegForm().getSubmitButton().onclick = registration;
            _guiManager.getLogoutBtn().onclick = logout;
        }
    };
})();

var loginFormModule = (function () {

    var form;
    var loginField,
        passwordField,
        loginBtn;      

    return {
        init: function () {
            form = document.getElementById("loginForm");
            loginField = document.getElementById("login");
            passwordField = document.getElementById("password");
            loginBtn = document.getElementById("loginBtn");
        },
        getLogin: function () { return loginField.value; },
        getPassword: function () { return passwordField.value; },
        getSubmitButton: function () { return loginBtn; },
        hide: function () { form.style.display = "none"; },
        open: function () { form.style.display = "block"; },
        isDataValid: function () { return true; }
    };
}());

var registrationFormModule = (function () {
    var form;
    var loginField,
        emailField,
        passwordField,
        passwordConfirmField,
        regBtn;        

    return {
        init: function () {
            form = document.getElementById("regForm");
            loginField = document.getElementById("regLogin");
            emailField = document.getElementById("regEmail");
            passwordField = document.getElementById("regPassword");
            passwordConfirmField = document.getElementById("regPasswordConfirm");
            regBtn = document.getElementById("regBtn");
        },
        getLogin: function () { return loginField.value; },
        getEmail: function () { return emailField.value; },
        getPassword: function () { return passwordField.value; },
        getPasswordConfirm: function () { return passwordConfirmField.value; },
        getSubmitButton: function () { return regBtn; },
        hide: function () { form.style.display = "none"; },
        open: function () { form.style.display = "block"; },
        isDataValid: function () { return true; }
    };
})();

var accountGuiModule = (function () {
    var _loginForm;
    var _regForm;
    var logoutBtn;
    var openLoginBtn,
        openRegistrationBtn,                
        dark;

    var openRegistration = function () {
        dark.style.display = "block";
        _loginForm.hide();
        _regForm.open();
    };

    var openLogin = function () {
        dark.style.display = "block";
        _regForm.hide();
        _loginForm.open();
    };

    return {        
        getLoginForm: function () { return _loginForm; },
        getRegForm: function () { return _regForm; },
        getLogoutBtn: function () { return logoutBtn; },
        openLogin: openLogin,
        openRegistration: openRegistration,
        hideAllForms: function () {
            dark.style.display = "none";
            _loginForm.hide();
            _regForm.hide();
        },
        init: function (loginForm, regForm) {
            openLoginBtn = document.getElementById("openLogin");
            openLoginBtn.onclick = function () { openLogin(); };
            openRegistrationBtn = document.getElementById("openReg");
            openRegistrationBtn.onclick = function () { openRegistration(); };
            logoutBtn = document.getElementById("logoutButton");            
            dark = document.getElementById("dark");
            _loginForm = loginForm;
            _loginForm.init();
            _regForm = regForm;
            _regForm.init();
        }
    };
})();
var dialogModule = (function () {
    var _guiManager;
    var uploadCount;
    var openedDialog;
    var dialogs;
    var dialogsStackNumber;
    var messagesPanelsContainer;            

    var removeDialogs = function () {
        while (_guiManager.getDialogsContainer().firstChild) {
            _guiManager.getDialogsContainer().firstChild.remove();
        }
        dialogs = [];
        dialogs.dialogsStackNumber = 1;
        openedDialog = null;
    };     

    var createDialogDiv = function (dialog) {
        var element = document.createElement("div");
        element.classList.add("conversation");
        element.id = dialog.id;
        element.onclick = function () {
            openDialog(dialog);
        };
        var photoDiv = document.createElement("div");
        photoDiv.classList.add("conversationPhoto");
        photoDiv.style.backgroundImage = "url('/images/" + dialog.image + "')";
        var convPreview = document.createElement("div");
        convPreview.classList.add("conversationPreview");
        var convTitle = document.createElement("div");
        convTitle.classList.add("conversationTitle");
        convTitle.innerText = dialog.title;
        var convMessage = document.createElement("div");
        convMessage.classList.add("conversationMessage");
        var convText = document.createElement("div");
        convText.classList.add("conversationText");
        convText.innerText = dialog.lastMessageText !== null ? dialog.lastMessageText : "";
        var convDate = document.createElement("div");
        convDate.classList.add("conversationDate");
        convDate.innerText = dialog.lastMessageDate !== null ? getDate(new Date(dialog.lastMessageDate)) : "";
        convMessage.appendChild(convText);
        convMessage.appendChild(convDate);
        convPreview.appendChild(convTitle);
        convPreview.appendChild(convMessage);
        element.appendChild(photoDiv);
        element.appendChild(convPreview);
        return element;
    };

    return {

        init: function (guiManager, uploadMessagesCount) {
            _guiManager = guiManager;
            uploadCount = uploadMessagesCount;
            openedDialog = null;
            dialogs = [];
            dialogsStackNumber = 1;
            messagesPanelsContainer = [];
        },

        getDialogById: function (id) {
            return dialogs.find(function (dialog) { return dialog.id === id; });
        },

        addDialog: function (serverDialog) {
            var dialog = new Dialog(serverDialog);
            _guiManager.getDialogsContainer().appendChild(dialog.element);
            messagesPanelsContainer.appendChild(dialog.messagesPanel);
            dialogs.push(dialog);
        },

        removeDialogs: removeDialogs,

        updateDialogs: function (dialogs) {
            removeDialogs();
            for (var i = 0; i < dialogs.length; i++) {
                addDialog(dialogs[i]);
            }
            dialogsStackNumber++;
        },

        getDialogByInterlocutorId: function (interlocutorId) {
            return dialogs.find(function (dialog) { return dialog.interlocutorId === interlocutorId; });
        }, 
        
        openDialog: function (dialog) {
            if (openedDialog === null || openedDialog.id !== dialog.id) {
                if (openedDialog !== null) {
                    openedDialog.Close();
                }
                if (!dialog.isPanelOpened) {
                    firstDialogMessagesUploading(dialog); // 
                }
                _guiManager.setDialog(dialog.title, dialog.status);
                dialog.Open();
                openedDialog = dialog;
            }
        },

        isDialogUploaded: function (interlocutorId) {
            var dialog = getDialogByInterlocutorId(interlocutorId);
            return dialog !== null && dialog !== undefined;
        },

        createDialogDiv: createDialogDiv,
        getDialogStackNumber: function () { returndialogsStackNumber; }
    };
})();

var dialogGuiModule = (function () {

    var dialogsContainer,
        dialogTitleDiv,
        dialogStatusDiv,
        messagesPanelsContainer,
        uploadingInfo,
        messageBox,
        mesSendBut,
        dark;

    return {

        init: function () {
            dialogsContainer = document.getElementById("dialogs");
            dialogTitleDiv = document.getElementById("conversationTitle");
            dialogStatusDiv = document.getElementById("conversationStatus");
            messagesPanelsContainer = document.getElementById("panelsInner");
            uploadingInfo = document.getElementById("uploading");
            messageBox = document.getElementById("mesInput");
            mesSendBut = document.getElementById("mesSendBut");
            dark = document.getElementById("dark");
        },

        getDialogsContainer: function () { return dialogsContainer; },
        getDialogTitleDiv: function () { return dialogTitleDiv; },
        getDialogStatusDiv: function () { return dialogStatusDiv; },
        getMessagesPanelsContainer: function () { return messagesPanelsContainer; },
        getUploadingInfo: function () { return uploadingInfo; },
        getMessageBox: function () { return messageBox; },
        getMesSendBut: function () { return mesSendBut; },
        getDark: function () { return dark; }, 
        
        setDialog: function (title, status) {
            dialogTitleDiv.innerText = title;
            dialogStatusDiv.innerText = status;
        },

        showUploading: function () {
            dark.style.display = "block";
            uploadingInfo.style.display = "flex";
        },

        hideUploading: function () {
            dark.style.display = "none";
            uploadingInfo.style.display = "none";
        }
    };
})();
var apiModule = (function () {
    var _fingerprint;

    var areTokensValid = function () {
        var token = localStorage.getItem("MAT");
        var refreshToken = localStorage.getItem("MRT");
        return token !== null && refreshToken !== null && token !== undefined && refreshToken !== undefined && token !== "" && refreshToken !== "";
    };

    var updateTokenTime = function (time) {
        var value = new Date(time).getTime();
        localStorage.setItem("ATGT", value);
        accessTokenGenerationTime = value;
    };

    var isTokenExpired = function () {
        return new Date().getTime() - accessTokenGenerationTime > 300000;
    };

    var sendRequest = function (request) {
        if (!isTokenExpired()) {
            $.ajax({
                url: request.url,
                type: request.type,
                contentType: "application/json",
                dataType: "json",
                data: request.type === "POST" ? JSON.stringify(request.data) : null,
                beforeSend: function (xhr) {
                    var token = localStorage.getItem("MAT");
                    if (token !== undefined) {
                        xhr.setRequestHeader("Authorization", "Bearer " + token);
                    }
                },
                success: function (data) {
                    request.handler(data);
                },
                statusCode: {
                    401: function (xhr) {
                        if (xhr.getResponseHeader("Token-Expired")) {
                            refreshToken(request);
                        } else {
                            //
                        }
                    }
                }
            });
        } else {
            refreshToken(request);
        }
    };

    var refreshToken = function (request) {
        var token = localStorage.getItem("MAT");
        var refreshToken = localStorage.getItem("MRT");
        if (areTokensValid() && isTokenExpired()) {
            var refresh = JSON.stringify({
                token: token,
                refreshtoken: refreshToken,
                fingerPrint: _fingerprpint
            });
            $.ajax({
                url: "/api/authentication/rfrshtkn",
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: refresh,
                success: function (data) {
                    if (data.isSuccessful) {
                        var tokens = JSON.parse(data.data);
                        localStorage.setItem("MAT", tokens.AccessToken);
                        localStorage.setItem("MRT", tokens.RefreshToken);
                        updateTokenTime(tokens.GenerationTime);
                        sendRequest(request);
                    } else {
                        console.log("Token refreshing error: " + data.errorMessages.join(' '));
                        localStorage.removeItem("MAT");
                        localStorage.removeItem("MRT");
                        //
                    }
                }
            });
        }
    };

    var isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
    }; 

    var getOS = function () {
        var userAgent = window.navigator.userAgent;
        var platform = window.navigator.platform;
        var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
        var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        var os = "Unknown";

        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'Mac OS';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
        } else if (/Linux/.test(platform)) {
            os = 'Linux';
        }
        return os;
    };

    var getBrowser = function () {
        var ua = navigator.userAgent,
            tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    };  

    return {
        init: function(fingerprint) {
            _fingerprint = fingerprint;
        },

        areTokensValid: areTokensValid,

        getDialogs: function(stackNumber, handler) {
            sendRequest(new MaelstormRequest("/api/dialog/getdialogs?stackNumber=" + stackNumber, handler));
        },

        getReadedMessages: function(dialogId, offset, count, handler) {
            sendRequest(new MaelstormRequest("/api/dialog/getReadedDialogMessages?dialogId=" + dialogId + "&offset=" + offset + "&count=" + count, handler, "GET"));
        },

        getUnreadedMessages: function(dialogId, count, handler) {
            sendRequest(new MaelstormRequest("/api/dialog/getUnreadedDialogMessages?dialogId=" + dialogId + "&count=" + count, handler, "GET"));
        },

        sendDialogMessage: function(message, onSuccessful) {
            if (message.targetId !== 0) {
                if (!isEmptyOrSpaces(message.text)) {
                    if (message.text.length > 1 && message.text.length < 4096) {
                        sendRequest(new MaelstormRequest("/api/dialog/sendmessage",
                            function (data) {
                                console.log(data);
                                if (data.isSuccessful) {
                                    onSuccessful(data);
                                }
                            },
                            "POST", message));
                    }
                }
            }
        },

        login: function(login, password, onSuccess, onFailed) {
            var model = {
                email: login,
                password: password,
                osCpu: getOS(),
                app: getBrowser(),
                fingerPrint: _fingerprint
            };
            $.ajax({
                url: "/api/authentication/auth",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(model),
                dataType: "json",
                success: function (data) {
                    if (data.isSuccessful) {
                        var tokens = JSON.parse(data.data);
                        localStorage.setItem("MAT", tokens.AccessToken);
                        localStorage.setItem("MRT", tokens.RefreshToken);
                        updateTokenTime(tokens.GenerationTime);
                        onSuccess();
                    } else {
                        onFailed();
                    }
                }
            });
        },

        registration: function(nickname, email, password, confirmPassword, onSuccess, onFailed) {
            if (!isEmptyOrSpaces(nickname) && !isEmptyOrSpaces(email) && !isEmptyOrSpaces(password) && !isEmptyOrSpaces(confirmPassword)) {
                if (password === confirmPassword) {
                    var model = {
                        nickname: nickname,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword
                    };
                    $.ajax({
                        url: "/api/account/registration",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(model),
                        dataType: "json",
                        success: function (data) {
                            if (data.isSuccessful) {
                                onSuccess();
                            }
                            else {
                                onFailed(data);
                            }
                        }
                    });
                }
            }
        },

        logOut: function() {
            sendRequest(new MaelstormRequest("/api/user/logout", null, "GET"));
            localStorage.clear();
        },

        getDialog: function(interlocutorId, handler) {
            sendRequest(new MaelstormRequest("/api/dialog/getdialog?interlocutorId=" + interlocutorId, handler));
        },            

        getSessions: function(handler) {
            sendRequest(new MaelstormRequest("/api/user/getsessions", handler, "GET"));
        },

        closeSession: function(sessionId, banDevice) {
            var data = { sessionId: sessionId, banDevice: banDevice };
            sendRequest(new MaelstormRequest("/api/user/closeSession", null, "POST", data));
        },

        getOnlineStatuses: function(ids, handler) {
            if (ids.length === 0) return;
            sendRequest(new MaelstormRequest("/user/getonlinestatuses", handler, "POST", ids));
        }
    };
})();
//var connectionGui = new ConnectionGuiManager();
//var dialogGui = new DialogGuiManager();
var accountGui = accountGuiModule;
var account = accountModule;
var loginForm = loginFormModule;
var regForm = registrationFormModule;
var dialog = dialogModule;
var dialogGui = dialogGuiModule;
var api = apiModule;
//var accountManager;
//var dialogManager = new DialogManager(dialogGui, 10);
var signlRConnection;

function init() {
    dialogGui.showUploading();
    api.getDialogs(dialog.getDialogsStackNumber, (dialogs) => {
        signlRConnection.StartConnection();
        dialog.updateDialogs(dialogs);        
        dialogGui.hideUploading();
    });
}

function main() {
    Fingerprint2.get(function(components) {
        var values = components.map(function (component) { return component.value; });
        var fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
        api.init(fingerprint);
        accountGui.init(loginForm, regForm);
        account.init(api, accountGui);
        dialogGui.init();
        dialog.init(dialogGui);
        //signalRConnection = new SignalRConnection(api, fingerprint, "/messageHub", dialogManager, connectionGui); 
        
        if (api.areTokensValid()) {
            init();
        } else {
            accountGui.openLogin();
        }
    });
}

main();