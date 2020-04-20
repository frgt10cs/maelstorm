let accountModule = (function () {
    let _api;
    let _guiManager;    
    let _onLogin;

    let login = function () {
        if (_guiManager.getLoginForm().isDataValid()) {
            _api.login(_guiManager.getLoginForm().getLogin(), _guiManager.getLoginForm().getPassword()).then(() => {
                _guiManager.hideAllForms();
                _onLogin();
            }, error => {
                console.log(error);
            });               
        }   
    };

    let registration = function () {
        if (_guiManager.getRegForm().isDataValid()) {
            _api.registration(_guiManager.getRegForm().getLogin(),
                _guiManager.getRegForm().getEmail(),
                _guiManager.getRegForm().getPassword(),
                _guiManager.getRegForm().getPasswordConfirm()).then(() => {
                    _guiManager.openLogin();
                }, error => {
                    console.log(error);
                });                
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