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
    var _api;
    var _uploadCount;
    var onNewMessage;
    var dialogContext;
    var _dateModule;

    var createDialogDiv = function (dialog) {
        var element = document.createElement("div");
        element.classList.add("conversation");
        element.id = dialog.id;
        element.onclick = function () {
            //openDialog(dialog); 
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
        convDate.innerText = dialog.lastMessageDate !== null ? _dateModule.getDate(new Date(dialog.lastMessageDate)) : "";
        convMessage.appendChild(convText);
        convMessage.appendChild(convDate);
        convPreview.appendChild(convTitle);
        convPreview.appendChild(convMessage);
        element.appendChild(photoDiv);
        element.appendChild(convPreview);
        return element;
    };

    var appendMessageToBegin = function (message) {
        dialogContext.messagesPanel.prepend(message.element);
    };

    var appendMessageToEnd = function (message) {
        dialogContext.messagesPanel.appendChild(message.element);
    };

    var createMessagesPanel = function () {
        var element = document.createElement("div");
        element.classList.add("conversationMessages");
        element.style.display = "none";
        element.onscroll = function () {
            onMessagesPanelScroll();
        };
        return element;
    };

    var onMessagesPanelScroll = function () {
        if (!dialogContext.uploadingBlocked) {
            if (thdialogContextis.messagesPanel.scrollTop < 10 && !dialogContext.allReadedUpload) {
                console.log("old upl");
                dialogContext.uploadingBlocked = true;
                uploadReadedMessages();
            }
            else if (dialogContext.messagesPanel.scrollHeight - dialogContext.messagesPanel.scrollTop - this.messagesPanel.offsetHeight < 10
                && !dialogContext.allUnreadedUpload && dialogContext.unreadedMessages.length === 0) {
                console.log("new upl");
                dialogContext.uploadingBlocked = true;
                uploadUnreadedMessages();
            }
        }
    };  

    var unreadedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allUnreadedUpload = true;
            for (var i = 0; i < messages.length; i++) {
                appendMessageToEnd(messages[i]);
                dialogContext.unreadedMessages.push(messages[i]);
            }
        }
        else {
            dialogContext.allUnreadedUpload = true;
        }
        dialogContext.uploadingBlocked = false;
    };

    var readedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allReadedUpload = true;
            dialogContext.readedMessagesOffset += messages.length;
            var resultScrollTop = 0;
            for (var i = 0; i < messages.length; i++) {
                appendMessageToBegin(messages[i]);
                dialogContext.messages.unshift(messages[i]);
                resultScrollTop += messages[i].element.offsetHeight;
            }
            dialogContext.messagesPanel.scrollTop = resultScrollTop;
        }
        else {
            dialogContext.allReadedUpload = true;
        }
        dialogContext.uploadingBlocked = false;
    };  

    var uploadUnreadedMessages = function () {
        _api.getUnreadedMessages(dialogContext.id, uploadCount, unreadedMessagesHandler);
    };

    var uploadReadedMessages = function () {
        _api.getReadedMessages(dialogContext.id, dialogContext.readedMessagesOffset, uploadCount, readedMessagesHandler);
    };

    var createDialog = function (serverDialog) {
        var dialog = {};
        dialog.id = serverDialog.id;
        dialog.title = serverDialog.title;
        dialog.lastMessageText = serverDialog.lastMessageText;
        dialog.lastMessageDate = serverDialog.lastMessageDate;
        dialog.image = serverDialog.image;
        dialog.interlocutorId = serverDialog.interlocutorId;
        dialog.isPanelOpened = false;
        dialog.unreadedMessages = [];
        dialog.messages = [];
        dialog.unconfirmedMessages = [];
        dialog.readedMessagesOffset = 0;
        dialog.allReadedUploaded = false;
        dialog.allUnreadedUploaded = false;
        dialog.uploadingBlocked = false;
        dialog.messagesPanel = createMessagesPanel();
        dialog.element = createDialogDiv(dialog);
        return dialog;
    };

    return {
        
        init: function (api, dateModule, uploadCount, onNewMessageHandler) {
            _api = api;
            _dateModule = dateModule;
            _uploadCount = uploadCount;
            onNewMessage = onNewMessageHandler;
        },

        setDialogContext: function (dialog) {
            dialogContext = dialog;
        },

        createDialog: createDialog,
        createDialogs: function (serverDialogs) {
            var dialogs = [];
            for (var i = 0; i < serverDialogs.length; i++) {
                dialogs.push(createDialog(serverDialogs[i]));
            }
            return dialogs;
        },

        addNewMessage: function (message) {
            if (dialogContext.isPanelOpened) {
                appendMessageToEnd(message);
                var isFromOther = message.authorId === dialog.interlocutorId;
                message.CreateMessageElement(isFromOther);
                if (isFromOther) {
                    dialogContext.unreadedMessages.push(message);
                } else {
                    dialogContext.messages.push(message);
                    dialogContext.readedMessagesOffset++;
                }
            }
            var preView = dialogContext.element.lastElementChild.lastElementChild;
            preView.firstElementChild.innerText = message.text;
            preView.lastElementChild.innerText = GetDate(new Date(message.dateOfSending));
            onNewMessage();            
        },

        unreadedMessagesHandler: function(messages) {
            if (messages !== null && messages !== undefined && messages.length > 0) {
                if (messages.length < _uploadCount) dialogContext.allUnreadedUpload = true;
                for (var i = 0; i < messages.length; i++) {
                    appendMessageToEnd(messages[i]);
                    dialogContext.unreadedMessages.push(messages[i]);
                }
            }
            else {
                dialogContext.allUnreadedUpload = true;
            }
            dialogContext.uploadingBlocked = false;
        },

        readedMessagesHandler: function(messages) {
            if (messages !== null && messages !== undefined && messages.length > 0) {
                if (messages.length < _uploadCount) dialogContext.allReadedUpload = true;
                dialogContext.readedMessagesOffset += messages.length;
                var resultScrollTop = 0;
                for (var i = 0; i < messages.length; i++) {
                    appendMessageToBegin(messages[i]);
                    dialogContext.messages.unshift(messages[i]);
                    resultScrollTop += messages[i].element.offsetHeight;
                }
                dialogContext.messagesPanel.scrollTop = resultScrollTop;
            }
            else {
                dialogContext.allReadedUpload = true;
            }
            dialogContext.uploadingBlocked = false;
        },  

        sendMessage: function (message) {
            var id = dialogContext.unconfirmedMessages.length;
            message.dateOfSending = new Date();
            message.status = -1;
            message.bindId = id;
            SendDialogMessage(message, (result) => {
                var info = JSON.parse(result.data);
                var confirmedMessage = dialogContext.unconfirmedMessages[info.bindId];
                confirmedMessage.id = info.id;
                confirmedMessage.element.id = info.id;
                confirmedMessage.statusDiv.style.backgroundImage = "url(/images/delivered.png)";
                unconfirmedMessages[info.bindId] = undefined;
            });
            dialogContext.unconfirmedMessages.push(message);
            dialogContext.addNewMessage(message);
        },

        uploadUnreadedMessages: uploadUnreadedMessages,

        uploadReadedMessages: uploadUnreadedMessages
    };
})();
var dialogsModule = (function () {
    var _guiManager;    
    var openedDialog;
    var dialogs;
    var dialogsStackNumber;               

    var removeDialogs = function () {
        while (_guiManager.getDialogsContainer().firstChild) {
            _guiManager.getDialogsContainer().firstChild.remove();
        }
        dialogs = [];
        dialogsStackNumber = 1;
        openedDialog = null;
    };             

    var addDialog = function (dialog) {        
        _guiManager.getDialogsContainer().appendChild(dialog.element);
        _guiManager.getMessagesPanelsContainer().appendChild(dialog.messagesPanel);
        dialogs.push(dialog);
    };

    return {

        init: function (guiManager) {
            _guiManager = guiManager;            
            openedDialog = null;
            dialogs = [];
            dialogsStackNumber = 1;            
        },

        getDialogById: function (id) {
            return dialogs.find(function (dialog) { return dialog.id === id; });
        },

        addDialog: addDialog,

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
                    openedDialog.messagesPanel.style.display = "none";
                }
                if (!dialog.isPanelOpened) {
                    firstDialogMessagesUploading(dialog); // 
                }
                _guiManager.setDialog(dialog.title, dialog.status);
                dialog.isPanelOpened = true;
                dialog.messagesPanel.style.display = "block";
                openedDialog = dialog;
            }
        },                

        isDialogUploaded: function (interlocutorId) {
            var dialog = getDialogByInterlocutorId(interlocutorId);
            return dialog !== null && dialog !== undefined;
        },
        
        getDialogsStackNumber: function () { return dialogsStackNumber; }
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
        },

        toTheTop: function (dialog) {
            dialogsContainer.insertBefore(dialog.element, dialogsContainer.firstChild);
        }
    };
})();
class MaelstormRequest {
    constructor(url, handler, type, data) {
        this.url = url;
        this.handler = handler;
        this.type = (type === undefined ? "GET" : type);
        this.data = data;
    }
}

var apiModule = (function () {
    var _fingerprint;

    var accessTokenGenerationTime;

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
                fingerPrint: _fingerprint
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
            accessTokenGenerationTime = Number(localStorage.getItem("ATGT"));
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
var dateModule = (function () {    
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sem", "Okt", "Nov", "Dec"];

    return {
        getDate: function (date) {
            var currentDate = new Date();
            var dateString = "";
            if (date.toDateString() !== currentDate.toDateString()) {
                if (date === currentDate.getDate() - 1) {
                    dateString = "Tomorrow";
                } else {
                    dateString = months[date.getMonth()] + " " + date.getDate();
                    if (date.getFullYear() !== currentDate.getFullYear()) {
                        dateString += " " + date.getFullYear();
                    }
                }
            } else {
                var minutes = date.getMinutes().toString();
                dateString = date.getHours() + ":" + (minutes.length === 2 ? minutes : "0" + minutes);
            }
            return dateString;
        }
    };
})();
var signalRModule = (function () {
    var url = "/messageHub";
    var connection;
    var timeToReconnect;
    var tryReconnectingCount;
    var isClosedByClient;
    var pingTime;
    var _api;
    var _fingerprint;
    var _dialogs;
    var _connectionGui;

    var auth = function () {
        connection.invoke("Authorize", localStorage.getItem("MAT"), _fingerprint);
    };   

    var initHandlers = function () {
        connection.onclose(() => {
            if (isClosedByClient || fingerprint === "") return;
            console.log("lost connection");
            startConnection();
        });

        connection.on("Ping", function (isAuth) {
            console.log("PONG, " + (isAuth ? "mister" : "anonym"));
            console.log("Ping: " + (new Date().getMilliseconds() - pingTime.getMilliseconds()));
        });

        connection.on("RecieveMessage", function (serverMessage) {
            var sm = JSON.parse(serverMessage);
            var message = new Message(sm.id, sm.dialogId, sm.authorId, sm.text, sm.replyId, sm.status, sm.dateOfSending);
            var dialog = _dialogs.getDialogById(message.dialogId);
            if (dialog !== undefined && dialog !== null) {
                dialog.addNewMessage(message);
            } else {
                _api.getDialog(message.authorId, function (dialog) {
                    _dialogs.addDialog(dialog);
                    _dialog.addNewMessage(message);
                });
            }
        });

        connection.on("MessageWasReaded", function (dialogId, messageId) {
            var dialog = _dialogs.getDialogById(dialogId);
            if (dialog !== undefined) {
                var messages = dialog.messages;
                for (var i = messages.length; i > 0; i--) {
                    if (messages[i].id === messageId) {
                        SetAsReaded(messages[i].element.firstChild);//!!
                        console.log("man read: " + messages[i].text);
                        break;
                    }
                }
            }
        });

        connection.on("OnHubAuthFalied", function () {
            alert("Auth failed");
        });

        connection.on("OnSessionClosed", function () {
            localStorage.clear();
            isClosedByClient = true;
            connection.stop();
            //accountManager.OpenLogin();
        });
    };

    var connected = function () {
        console.log("connected");
        tryReconnectingCount = -1;
        _connectionGui.showConnected();
        auth();        
    };

    var connecting = function () {
        console.log("connecting...");
        _connectionGui.showConnecting();        
    };

    var disconnected = function () {
        console.log("disconnected");
        _connectionGui.showDisconnected();
    };

    return {
        init: function (api, fingerprint, dialogsModule, connectionGui) {
            _api = api;
            _fingerprint = fingerprint;
            _dialogs = dialogsModule;
            _connectionGui = connectionGui;
            timeToReconnect = [0, 2000, 2000, 4000, 6000];
            tryReconnectingCount = -1;
            isClosedByClient = false;
            pingTime = null;
            connection = new signalR.HubConnectionBuilder()
                .withUrl(url).configureLogging(signalR.LogLevel.None).build();
            initHandlers();
        },

        startConnection: function () {
            if (connection !== null && _fingerprint !== "" && connection.connectionState !== 1) {
                connecting();
                connection.start()
                    .then(connected)
                    .catch(function (error) {
                        console.log("error on connecting");
                        tryReconnectingCount += 1;
                        if (tryReconnectingCount < timeToReconnect.length)
                            setTimeout(() => startConnection(), timeToReconnect[tryReconnectingCount]);
                        else {
                            disconnected();
                        }
                    });
            } else {
                connected();
            }
        },

        ping: function () {
            if (connection.connectionState === 1) {
                pingTime = new Date();
                connection.invoke("Ping");
            } else {
                console.log("Disconnected");
            }
        }
    };
})();

var connectionGuiModule = (function () {
    var connectingInfo;
    var connectedInfo;
    var disconnectedInfo;
    return {
        init: function () {
            connectingInfo = document.getElementById("connecting");
            connectedInfo = document.getElementById("connected");
            disconnectedInfo = document.getElementById("disconnected"); 
        },

        showConnecting: function () {
            connectingInfo.style.display = "flex";        
        },

        hideConnectInfo: function () {
            connectingInfo.style.display = "none";
            connectedInfo.style.display = "none";
        },

        showConnected: function () {
            connectedInfo.style.display = "flex";
            connectingInfo.style.display = "none";
            setTimeout(function () {
                connectedInfo.style.display = "none";
            }, 2500);
        },

        showDisconnected: function () {
            hideConnectInfo();
            disconnectedInfo.style.display = "flex";
        }
    };
})();
var accountGui = accountGuiModule;
var account = accountModule;
var loginForm = loginFormModule;
var regForm = registrationFormModule;
var dialogs = dialogsModule;
var dialog = dialogModule;
var dialogGui = dialogGuiModule;
var date = dateModule;
var api = apiModule;
var signalRConnection = signalRModule;
var connectionGui = connectionGuiModule;

function init() {
    dialogGui.showUploading();
    api.getDialogs(dialogs.getDialogsStackNumber(), (data) => {
        signalRConnection.startConnection();
        dialogs.updateDialogs(dialog.createDialogs(data));        
        dialogGui.hideUploading();
    });
}

function initModules(fingerprint) {
    api.init(fingerprint);
    accountGui.init(loginForm, regForm);
    account.init(api, accountGui);
    dialogGui.init();
    dialog.init(api, date, 50, dialogGui.toTheTop);
    dialogs.init(dialogGui);
    connectionGui.init();
    signalRConnection.init(api, fingerprint, dialogs, connectionGui);    
}

function main() {
    Fingerprint2.get(function(components) {
        var values = components.map(function (component) { return component.value; });
        var fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
        initModules(fingerprint);        
        
        if (api.areTokensValid()) {
            init();
        } else {
            accountGui.openLogin();
        }
    });
}

main();