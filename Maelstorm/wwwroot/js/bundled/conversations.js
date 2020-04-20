let accountModule = (function () {
    let _api;
    let _guiManager;    
    let _onLogin;

    let login = function () {
        if (_guiManager.getLoginForm().isDataValid()) {
            _api.login(_guiManager.getLoginForm().getLogin(), _guiManager.getLoginForm().getPassword(),
                () => {                    
                    _guiManager.hideAllForms();
                    _onLogin();
                },
                () => {                    
                    alert("Login failed");
                });
        }   
    };

    let registration = function () {
        if (_guiManager.getRegForm().isDataValid()) {
            _api.registration(_guiManager.getRegForm().getLogin(),
                _guiManager.getRegForm().getEmail(),
                _guiManager.getRegForm().getPassword(),
                _guiManager.getRegForm().getPasswordConfirm(),
                () => { _guiManager.openLogin(); },
                (data) => { /*onRegistrationFailed(data);*/ });
        }  
    };

    let logout = function () {
        _api.logOut();
        _guiManager.openLogin();
    };

    return {
        init: function (api, guiManager, onLogin) {
            _api = api;
            _guiManager = guiManager;
            _guiManager.getLoginForm().getSubmitButton().onclick = login;
            _guiManager.getRegForm().getSubmitButton().onclick = registration;
            _guiManager.getLogoutBtn().onclick = logout;
            _onLogin = onLogin;
        }
    };
})();

let loginFormModule = (function () {

    let form;
    let loginField,
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

let registrationFormModule = (function () {
    let form;
    let loginField,
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

let accountGuiModule = (function () {
    let _loginForm;
    let _regForm;
    let logoutBtn;
    let openLoginBtn,
        openRegistrationBtn,                
        dark;

    let openRegistration = function () {
        dark.style.display = "block";
        _loginForm.hide();
        _regForm.open();
    };

    let openLogin = function () {
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
var cryptoModule = (function () {
    var _encoding;

    var validatePassphrase = function (passphrase, length) {
        var requiredLength = length / 8;
        if (passphrase.length < requiredLength)
            passphrase = passphrase + passphrase.substring(0, requiredLength - passphrase.length);
        else if (passphrase.length > requiredLength)
            passphrase = passphrase.substring(0, requiredLength);
        return passphrase;
    }

    return {
        init: function (encoding) {
            _encoding = encoding;
        },

        generateIV: function() {

        },

        genereateAesKeyByPassPhrase: function(passphrase, length) {
            passphrase = validatePassphrase(passphrase, length);
            var keyBytes = getBytes(passphrase);
            return window.crypto.subtle.importKey(
                "raw",
                keyBytes,
                "AES-CBC",
                true,
                ["encrypt", "decrypt"]
            );
        },

        encryptAes: function(aesKey, iv, plainText) {
            var dataBytes = _encoding.getBytes(plainText);
            return window.crypto.subtle.encrypt({
                name: "AES-CBC",                
                iv: iv,
            },
            aesKey, dataBytes);
        },

        decryptAes: function(aesKey, iv, encryptedDataBase64) {
            var encryptedBytes = _encoding.base64ToArray(encryptedDataBase64);
            return window.crypto.subtle.decrypt({
                name: "AES-CBC",
                iv: iv,
            },
            aesKey, encryptedBytes);
        }       
    }
})();
let dialogModule = (function () {
    let _api;
    let _date;
    let _guiManager;   
    let _uploadCount;
    let _message;
    let onNewMessage;
    let dialogContext;   

    let appendMessageToBegin = function (message) {
        dialogContext.messagesPanel.prepend(message.element);
    };

    let appendMessageToEnd = function (message) {
        dialogContext.messagesPanel.appendChild(message.element);
    };

    let createMessagesPanel = function () {
        let element = document.createElement("div");
        element.classList.add("conversationMessages");
        element.classList.add("hideScroll");
        element.style.display = "none";
        element.onscroll = function () {
            onMessagesPanelScroll();
        };
        return element;
    };

    let onMessagesPanelScroll = function () {
        if (!dialogContext.uploadingBlocked) {
            if (dialogContext.messagesPanel.scrollTop < 10 && !dialogContext.allReadedUpload) {
                console.log("old upl");
                dialogContext.uploadingBlocked = true;
                uploadReadedMessages();
            }
            else if (dialogContext.messagesPanel.scrollHeight - dialogContext.messagesPanel.scrollTop - dialogContext.messagesPanel.offsetHeight < 10
                && !dialogContext.allUnreadedUpload && dialogContext.unreadedMessages.length === 0) {
                console.log("new upl");
                dialogContext.uploadingBlocked = true;
                uploadUnreadedMessages();
            }
        }
    };  

    let isMessageFromOther = function (message) {
        return dialogContext.interlocutorId === message.authorId;
    };

    let unreadedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allUnreadedUpload = true;
            for (let i = 0; i < messages.length; i++) {
                _message.setElement(messages[i], isMessageFromOther(messages[i]));
                appendMessageToEnd(messages[i]);
                dialogContext.unreadedMessages.push(messages[i]);
            }
        }
        else {
            dialogContext.allUnreadedUpload = true;
        }
        dialogContext.uploadingBlocked = false;
    };

    let readedMessagesHandler = function (messages) {
        if (messages !== null && messages !== undefined && messages.length > 0) {
            if (messages.length < _uploadCount) dialogContext.allReadedUpload = true;
            dialogContext.readedMessagesOffset += messages.length;
            let resultScrollTop = 0;
            for (let i = 0; i < messages.length; i++) {
                _message.setElement(messages[i], isMessageFromOther(messages[i]));
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

    let uploadUnreadedMessages = function () {
        _api.getUnreadedMessages(dialogContext.id, _uploadCount, unreadedMessagesHandler);
    };

    let uploadReadedMessages = function () {
        _api.getReadedMessages(dialogContext.id, dialogContext.readedMessagesOffset, _uploadCount, readedMessagesHandler);
    };

    let createDialog = function (serverDialog) {      
        serverDialog.isPanelOpened = false;
        serverDialog.unreadedMessages = [];
        serverDialog.messages = [];
        serverDialog.unconfirmedMessages = [];
        serverDialog.readedMessagesOffset = 0;
        serverDialog.allReadedUploaded = false;
        serverDialog.allUnreadedUploaded = false;
        serverDialog.uploadingBlocked = false;
        serverDialog.messagesPanel = createMessagesPanel();
        serverDialog.element = _guiManager.createDialogLi(serverDialog);
        return serverDialog;
    };

    let firstDialogMessagesUploading = function () {
        uploadReadedMessages();
    };

    let createMessage = function () {
        let message = {};
        _message.setText(message, _guiManager.getMessageText());        
        message.targetId = dialogContext.interlocutorId;
        let id = dialogContext.unconfirmedMessages.length;
        message.dateOfSending = new Date();
        message.status = -1;
        message.bindId = id;
        return message;
    };

    let sendMessage = function (message) {       
        addNewMessage(message);
        dialogContext.unconfirmedMessages.push(message);  
        _api.sendDialogMessage(message, (result) => {
            let info = JSON.parse(result.data);
            let confirmedMessage = dialogContext.unconfirmedMessages[info.bindId];
            confirmedMessage.id = info.id;
            confirmedMessage.element.id = info.id;
            confirmedMessage.statusDiv.style.backgroundImage = "url(/images/delivered.png)";
            dialogContext.unconfirmedMessages[info.bindId] = undefined;
        });              
    };

    let addNewMessage = function (message) {
        if (dialogContext.isPanelOpened) {            
            let isFromOther = isMessageFromOther(message);
            _message.setElement(message, isFromOther);            
            if (isFromOther) {
                dialogContext.unreadedMessages.push(message);
            } else {
                dialogContext.messages.push(message);
                dialogContext.readedMessagesOffset++;
            }
            appendMessageToEnd(message);
        }        
        let previewText = dialogContext.element.lastElementChild.children[1].lastElementChild.lastElementChild;
        previewText.innerText = message.text;
        dialogContext.element.lastElementChild.lastElementChild.innerText = _date.getDate(new Date(message.dateOfSending));
        onNewMessage(dialogContext);
    };

    var updateInterlocutorStatus = function () {
        _api.getOnlineStatuses([dialogContext.interlocutorId], function (statuses) {
            _guiManager.getDialogStatusDiv().innerText = statuses[0].isOnline ? "online" : "offline";
        });
    };

    return {

        init: function (api, guiManager, messageModule, dateModule, uploadCount, onNewMessageHandler) {
            _api = api;
            _guiManager = guiManager;
            _message = messageModule;
            _date = dateModule;
            _uploadCount = uploadCount;
            onNewMessage = onNewMessageHandler;
            _guiManager.getMessageSendBtn().onclick = function () {
                sendMessage(createMessage());
                _guiManager.clearMessageTextInput();
            };
        },

        setDialogContext: function (dialog) {
            dialogContext = dialog;
        },

        openDialog: function () {
            if (!dialogContext.isPanelOpened) {                
                firstDialogMessagesUploading();
            }
            dialogContext.isPanelOpened = true;
            dialogContext.messagesPanel.style.display = "block";
            _guiManager.setDialog(dialogContext.title);    
            updateInterlocutorStatus();
        },        

        createDialog: createDialog,

        createDialogs: function (serverDialogs) {
            var dialogs = [];
            for (let i = 0; i < serverDialogs.length; i++) {
                dialogs.push(createDialog(serverDialogs[i]));
            }
            return dialogs;
        },

        addNewMessage: addNewMessage,

        unreadedMessagesHandler: unreadedMessagesHandler,

        readedMessagesHandler: readedMessagesHandler,  

        sendMessage: sendMessage,

        uploadUnreadedMessages: uploadUnreadedMessages,

        uploadReadedMessages: uploadUnreadedMessages
    };
})();

let dialogGuiModule = (function () {
    let _date;
    let dialogTitleDiv;
    let dialogStatusDiv;
    let messageSendBtn;
    let messageTextBox;    

    let smallDeviceMenuInit = function () {
        let dialogListContainer = document.getElementById("dialogListContainer");
        let openedDialogContainer = document.getElementById("openedDialogContainer");

        let openDialogListBtn = document.getElementById("openDialogListBtn");
        let openOpenedDialogBtn = document.getElementById("openOpenedDialogBtn");

        openDialogListBtn.onclick = function () {
            dialogListContainer.className = dialogListContainer.className.replace("d-none", "d-block");
            openedDialogContainer.className = openedDialogContainer.className.replace("d-flex", "d-none");
            openOpenedDialogBtn.className = openOpenedDialogBtn.className.replace("bg-dark-5", "bg-dark-2");
            openDialogListBtn.className = openDialogListBtn.className.replace("bg-dark-2", "bg-dark-5");
        }

        openOpenedDialogBtn.onclick = function () {
            dialogListContainer.className = dialogListContainer.className.replace("d-block", "d-none");
            openedDialogContainer.className = openedDialogContainer.className.replace("d-none", "d-flex");
            openOpenedDialogBtn.className = openOpenedDialogBtn.className.replace("bg-dark-2", "bg-dark-5");
            openDialogListBtn.className = openDialogListBtn.className.replace("bg-dark-5", "bg-dark-2");
        }
    }

    return {
        init: function (dateModule) {
            _date = dateModule;
            dialogTitleDiv = document.getElementById("dialogInfoTitle");
            dialogStatusDiv = document.getElementById("dialogInfoStatus");
            messageTextBox = document.getElementById("messageTextBox");
            messageSendBtn = document.getElementById("messageSendBtn");  
            //if (window.screen.width < 992)
                smallDeviceMenuInit();
        },

        createDialogLi: function (dialog) {
            var element = document.createElement("li");            
            element.className = "list-group-item mt-1 bg-dark-2 text-white border-0";
            element.id = dialog.id;

            var dialogInner = document.createElement("div");
            dialogInner.className = "row position-relative";

            var photoContainer = document.createElement("div");
            photoContainer.className = "col-auto pl-0 pr-0";

            var photoDiv = document.createElement("div");
            photoDiv.className = "dialogPhoto";
            photoDiv.style.backgroundImage = "url('/images/" + dialog.image + "')";

            var dialogPreviewContainer = document.createElement("div");
            dialogPreviewContainer.className = "col-8";

            var dialogPreview = document.createElement("div");
            dialogPreview.className = "dialogPreview";

            var dialogTitle = document.createElement("div");
            dialogTitle.className = "dialogTitle";
            dialogTitle.innerText = dialog.title;

            var dialogMessage = document.createElement("div");
            dialogMessage.className = "dialogTextPreview";
            dialogMessage.innerText = dialog.lastMessageText !== null ? dialog.lastMessageText : "";

            var dialogDate = document.createElement("div");
            dialogDate.className = "dialogDate";
            dialogDate.innerText = dialog.lastMessageDate !== null ? _date.getDate(new Date(dialog.lastMessageDate)) : "";

            photoContainer.appendChild(photoDiv);
            dialogPreview.appendChild(dialogTitle);
            dialogPreview.appendChild(dialogMessage);
            dialogPreviewContainer.appendChild(dialogPreview);
            dialogInner.appendChild(photoContainer);
            dialogInner.appendChild(dialogPreviewContainer);
            dialogInner.appendChild(dialogDate);
            element.appendChild(dialogInner);

            return element;
        },

        getDialogTitleDiv: function () { return dialogTitleDiv; },
        getDialogStatusDiv: function () { return dialogStatusDiv; },
        getMessageText: function () { return messageTextBox.value; },
        getMessageSendBtn: function () { return messageSendBtn },   

        clearMessageTextInput: function () { messageTextBox.value = ""; },

        setDialog: function (title) {
            dialogTitleDiv.innerText = title;            
        }        
    };
})();
class Dialog {

    constructor(serverDialog) {        
        this.id = serverDialog.id;
        this.title = serverDialog.title;
        this.lastMessageText = serverDialog.lastMessageText;
        this.lastMessageDate = serverDialog.lastMessageDate;
        this.image = serverDialog.image;
        this.interlocutorId = serverDialog.interlocutorId;
        this.isPanelOpened = false;
        this.unreadedMessages = [];
        this.messages = [];
        this.unconfirmedMessages = [];
        this.readedMessagesOffset = 0;
        this.allReadedUploaded = false;
        this.allUnreadedUploaded = false;
        this.uploadingBlocked = false;
        this.uploadCount = 20;
        this.messagesPanel = this.createMessagesPanel();        
    }

    openDialog() {
        if (!this.isPanelOpened) {
            this.firstDialogMessagesUploading();
        }
        this.isPanelOpened = true;
        this.messagesPanel.style.display = "block";
    }

    addNewMessage(message) {
        if (this.isPanelOpened) {
            this.appendMessageToEnd(message);
            var isFromOther = message.authorId === dialog.interlocutorId;
            message.CreateMessageElement(isFromOther);
            if (isFromOther) {
                this.unreadedMessages.push(message);
            } else {
                this.messages.push(message);
                this.readedMessagesOffset++;
            }
        }
        var preView = this.element.lastElementChild.lastElementChild;
        preView.firstElementChild.innerText = message.text;
        preView.lastElementChild.innerText = GetDate(new Date(message.dateOfSending));        
    }

    appendMessageToBegin(message) {
        this.messagesPanel.prepend(message.element);
    }

    appendMessageToEnd(message) {
        this.messagesPanel.appendChild(message.element);
    }       
}
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

    // more
    let setText = function (message, text) {
        if (!isEmptyOrSpaces(text)) {
            text = text.trim();
            text = text.replace(/\s\s+/g, ' ');
            message.text = text;
        }
    };

    let isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
    };

    return {

        init: function () {
        
        },
               
        setElement: setElement,        
        setStatus: setStatus,
        updateStatus: updateStatus,
        setText: setText
    };
})();
var dialogsModule = (function () {  
    var _api;
    var _guiManager;    
    var _dialog;
    var openedDialog;
    var dialogs;               

    var removeDialogs = function () {        
        while (_guiManager.getDialogsContainer().firstChild) {
            _guiManager.getDialogsContainer().firstChild.remove();
        }
        dialogs = [];
        dialogsStackNumber = 1;
        openedDialog = null;
    };             

    var addDialog = function (dialog) {        
        dialog.element.onclick = function () { openDialog(dialog); };
        _guiManager.getDialogsContainer().appendChild(dialog.element);
        _guiManager.getMessagesPanelsContainer().appendChild(dialog.messagesPanel);
        dialogs.push(dialog);        
    };

    var openDialog = function (dialog) {
        if (openedDialog === null || openedDialog.id !== dialog.id) {
            if (openedDialog !== null) {
                openedDialog.messagesPanel.style.display = "none";
            }
            _dialog.setDialogContext(dialog);            
            _dialog.openDialog();            
            openedDialog = dialog;
        }
    };

    var openOrCreateDialog = function (userInfo) {
        var dialog = getDialogByInterlocutorId(userInfo.id);
        if (dialog !== null && dialog !== undefined) {
            openDialog(dialog);
        } else {
            _api.getDialog(userInfo.id, (dialog) => {                
                dialog = _dialog.createDialog(dialog);
                addDialog(dialog);
                openDialog(dialog);
            });
        }
    };

    var getDialogByInterlocutorId = function (interlocutorId) {
        return dialogs.find(function (dialog) { return dialog.interlocutorId === interlocutorId; });
    };

    return {

        init: function (api, guiManager, dialogModule) {  
            _api = api;
            _guiManager = guiManager;  
            _dialog = dialogModule;
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

        getDialogByInterlocutorId: getDialogByInterlocutorId, 

        openDialog: openDialog,       
        openOrCreateDialog: openOrCreateDialog,

        isDialogUploaded: function (interlocutorId) {
            var dialog = getDialogByInterlocutorId(interlocutorId);
            return dialog !== null && dialog !== undefined;
        },

        getDialogsOffset: function () { return dialogs.length; }
    };
})();

var dialogsGuiModule = (function () {

    var dialogsContainer,
        messagesPanelsContainer,
        uploadingInfo,        
        dark;        

    return {
        init: function () {            
            dialogsContainer = document.getElementById("dialogs");            
            messagesPanelsContainer = document.getElementById("panelsInner");
            uploadingInfo = document.getElementById("uploading");            
            dark = document.getElementById("dark");
        },                
        
        getDialogsContainer: function () { return dialogsContainer; },        
        getMessagesPanelsContainer: function () { return messagesPanelsContainer; },
        getUploadingInfo: function () { return uploadingInfo; },        
        getDark: function () { return dark; },                 

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
var userModule = (function () {
    var _api;
    var _guiManager;  
    var _dialogs;
    var prevSearch;
    var openedUserInfo;

    var getUserInfo = function (userId) {
        _api.getUserInfo(userId, function (userInfo) {
            openedUserInfo = userInfo;
            _guiManager.setUserInfo(userInfo);
            _guiManager.showUserInfo();            
        });
    };

    var createUserFoundElement = function (user) {
        var box = document.createElement("div");
        box.classList.add("userPreviewInner");
        box.onclick = function () {
            getUserInfo(user.id);            
        };
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
        init: function (api, guiManager, dialogs) {
            _api = api;
            _guiManager = guiManager;
            _dialogs = dialogs;
            _guiManager.setFindUserFunc(findUserByNickname);
            _guiManager.getUserInfoOpenDialog().onclick = function () {
                _dialogs.openOrCreateDialog(openedUserInfo);
                _guiManager.closeUserInfo();
            };
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
            dark = document.getElementById("dark");
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
        },

        showUserInfo: function() {
            dark.style.display = "block";
            userInfoPanel.style.display = "block";
        },

        closeUserInfo: function () {
            dark.style.display = "none";
            userInfoPanel.style.display = "none";
        }        
    };
})();
var sessionModule = (function () {
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
                    console.log(data);
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

        getDialogs: function(offset, count, handler) {
            sendRequest(new MaelstormRequest("/api/dialog/getdialogs?offset=" + offset+"&count="+count, handler));
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
                        var result = JSON.parse(data.data);
                        localStorage.setItem("MAT", result.Tokens.AccessToken);
                        localStorage.setItem("MRT", result.Tokens.RefreshToken);
                        localStorage.setItem("IV", result.IVBase64);
                        console.log(result.EncryptedPrivateKey);
                        updateTokenTime(result.Tokens.GenerationTime);
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
            sendRequest(new MaelstormRequest("/api/user/getonlinestatuses", handler, "POST", ids));
        },

        findByNickname: function (nickname, handler) {
            sendRequest(new MaelstormRequest("/api/finder/finduser?nickname=" + nickname, handler));
        },

        getUserInfo: function (userId, handler) {
            sendRequest(new MaelstormRequest("/api/user/getuserinfo?userId=" + userId, handler));
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
    var _accountGui;    

    var auth = function () {
        connection.invoke("Authorize", localStorage.getItem("MAT"), _fingerprint);
    };   

    var startConnection = function () {
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
    };

    var initHandlers = function () {
        connection.onclose(() => {
            if (isClosedByClient || _fingerprint === "") return;
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
            _accountGui.openLogin();
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
        init: function (api, fingerprint, dialogsModule, connectionGui, accountGui) {
            _api = api;
            _fingerprint = fingerprint;
            _dialogs = dialogsModule;
            _connectionGui = connectionGui;
            _accountGui = accountGui;
            timeToReconnect = [0, 2000, 2000, 4000, 6000];
            tryReconnectingCount = -1;
            isClosedByClient = false;
            pingTime = null;
            connection = new signalR.HubConnectionBuilder()
                .withUrl(url).configureLogging(signalR.LogLevel.None).build();
            initHandlers();
        },

        startConnection: startConnection,

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

    var hideConnectInfo = function () {
        connectingInfo.style.display = "none";
        connectedInfo.style.display = "none";
    };

    return {
        init: function () {
            connectingInfo = document.getElementById("connecting");
            connectedInfo = document.getElementById("connected");
            disconnectedInfo = document.getElementById("disconnected"); 
        },

        showConnecting: function () {
            connectingInfo.style.display = "flex";        
        },

        hideConnectInfo: hideConnectInfo,

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
var settingsModule = (function () {
    var _guiManager;
    return {
        init: function (guiManager) {
            _guiManager = guiManager;
            _guiManager.getSettingsPanelSlider().onclick = function () { _guiManager.changeSettingsOpenState(); };
        }
    };
})();

var settingsGuiModule = (function () {
    var settingsPanel;
    var settingPanelSlider;
    var settingsContainers;
    var isPanelOpened = false;
    var hideWidth;

    var initSettingsPanel = function () {
        for (var i = 0; i < settingsContainers.length; i++) {
            var inner = settingsContainers[i].children[1];
            settingsContainers[i].children[0].onclick = function () {
                $(inner).slideToggle("slow");
            };
        }
    };

    return {
        init: function () {
            settingsPanel = document.getElementById("settingsPanel");
            settingPanelSlider = document.getElementById("settingsPanelSlider");
            settingsContainers = document.getElementsByClassName("settingsContainer");
            hideWidth = -settingsPanel.offsetWidth + settingPanelSlider.offsetWidth
            initSettingsPanel();
        },

        changeSettingsOpenState: function () {
            if (isPanelOpened) {
                $(settingsPanel).animate({ left: hideWidth + "px" }, 500);
                settingPanelSlider.style.backgroundImage = "url(/images/openPanel.png)";
            }
            else {
                $(settingsPanel).animate({ left: "0px" }, 500);
                settingPanelSlider.style.backgroundImage = "url(/images/closePanel.png)";
            }
            isPanelOpened = !isPanelOpened;
        },

        getSettingsPanelSlider: function () { return settingPanelSlider; }
    }
})();
var accountGui = accountGuiModule;
var account = accountModule;
var loginForm = loginFormModule;
var regForm = registrationFormModule;
var dialogs = dialogsModule;
var dialog = dialogModule;
var message = messageModule;
var dialogsGui = dialogsGuiModule;
var dialogGui = dialogGuiModule;
var date = dateModule;
var api = apiModule;
var signalRConnection = signalRModule;
var connectionGui = connectionGuiModule;
var user = userModule;
var userGui = userGuiModule;
var session = sessionModule;
var sessionGui = sessionGuiModule;
var settings = settingsModule;
var settingsGui = settingsGuiModule;
var crypto = cryptoModule;

function init() {
    dialogsGui.showUploading();
    api.getDialogs(dialogs.getDialogsOffset(), 20, (data) => {
        signalRConnection.startConnection();
        dialogs.updateDialogs(dialog.createDialogs(data));        
        dialogsGui.hideUploading();
    });
}

function initModules(fingerprint) {
    api.init(fingerprint);
    accountGui.init(loginForm, regForm);
    account.init(api, accountGui, init);
    dialogsGui.init();
    dialogGui.init(date);
    dialog.init(api, dialogGui, message, date, 20, dialogsGui.toTheTop);
    dialogs.init(api, dialogsGui, dialog);
    connectionGui.init();
    signalRConnection.init(api, fingerprint, dialogs, connectionGui, accountGui);
    sessionGui.init();
    session.init(api, sessionGui);
    userGui.init();
    user.init(api, userGui, dialogs);
    settingsGui.init();
    settings.init(settingsGui);    
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