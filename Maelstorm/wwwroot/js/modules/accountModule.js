let accountModule = (function () {
    let _api;
    let _guiManager;         
    let privateKey;    
    let _onLogin;

    let login = async function () {
        if (_guiManager.getLoginForm().isDataValid()) {
            try {
                await _api.login(_guiManager.getLoginForm().getLogin(), _guiManager.getLoginForm().getPassword());
                _guiManager.hideAllForms();
                _onLogin();
            }
            catch (error) {
                if (error === "Wrong login or password") {
                    _guiManager.getLoginForm().setLoginStatus(error);
                }
                else {                    
                    _guiManager.getLoginForm().setLoginStatus("Connection error");
                    console.log(error);
                }
            }
        }
        else {
            throw new Error("Invalid login or password");
        }
    };

    let registration = async function () {
        if (_guiManager.getRegForm().isDataValid()) {
            try {
                await _api.registration(_guiManager.getRegForm().getLogin(),
                    _guiManager.getRegForm().getEmail(),
                    _guiManager.getRegForm().getPassword(),
                    _guiManager.getRegForm().getPasswordConfirm());
                _guiManager.openLogin();
            }
            catch(error) {
                _guiManager.getRegForm().setRegStatus(error);
            }                     
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
        },

        getPrivateKey: function () {
            return privateKey;
        }       
    };
})();

let loginFormModule = (function () {

    let form;
    let loginTextBox,
        passwordTextBox,
        loginBtn,
        statusDiv;

    return {
        init: function () {
            form = document.getElementById("loginForm");
            loginTextBox = document.getElementById("login");
            passwordTextBox = document.getElementById("password");
            loginBtn = document.getElementById("loginBtn");
            statusDiv = document.getElementById("loginStatus");
        },
        getLogin: function () { return loginTextBox.value; },
        getPassword: function () { return passwordTextBox.value; },
        getSubmitButton: function () { return loginBtn; },
        hide: function () { form.style.display = "none"; },
        open: function () { form.style.display = "block"; },
        isDataValid: function () { return true; },
        setLoginStatus: function (value) { statusDiv.innerText = value; }
    };
}());

let registrationFormModule = (function () {
    let form;
    let loginField,
        emailField,
        passwordField,
        passwordConfirmField,
        regBtn,
        statusDiv;

    return {
        init: function () {
            form = document.getElementById("regForm");
            loginField = document.getElementById("regLogin");
            emailField = document.getElementById("regEmail");
            passwordField = document.getElementById("regPassword");
            passwordConfirmField = document.getElementById("regPasswordConfirm");
            regBtn = document.getElementById("regBtn");
            statusDiv = document.getElementById("regStatus");
        },
        getLogin: function () { return loginField.value; },
        getEmail: function () { return emailField.value; },
        getPassword: function () { return passwordField.value; },
        getPasswordConfirm: function () { return passwordConfirmField.value; },
        getSubmitButton: function () { return regBtn; },
        hide: function () { form.style.display = "none"; },
        open: function () { form.style.display = "block"; },
        isDataValid: function () { return true; },
        setRegStatus: function (value) { statusDiv.innerText = value; }
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