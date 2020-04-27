let accountModule = (function () {
    let _api;
    let _guiManager;         
    let privateKey;    
    let _onLogin;

    let login = async function () {
        let validationResult = _guiManager.getLoginForm().getDataValidationResult();
        if (validationResult.isSuccess) {
            try {
                await _api.login(_guiManager.getLoginForm().getLogin(), _guiManager.getLoginForm().getPassword());
                _guiManager.getLoginForm().clearErrors();
                _guiManager.hideAllForms();
                _onLogin();
            }
            catch (errors) {  
                _guiManager.getLoginForm().clearErrors();
                _guiManager.getLoginForm().addErrors([errors]);
            }
        }
        else {
            _guiManager.getLoginForm().clearErrors();
            _guiManager.getLoginForm().addErrors(validationResult.errorMessages);
        }
    };

    let registration = async function () {
        let validationResult = _guiManager.getRegForm().getDataValidationResult();
        if (validationResult.isSuccess) {
            try {
                await _api.registration(_guiManager.getRegForm().getLogin(),
                    _guiManager.getRegForm().getEmail(),
                    _guiManager.getRegForm().getPassword(),
                    _guiManager.getRegForm().getPasswordConfirm());
                _guiManager.getRegForm().clearErrors();
                _guiManager.openLogin();
            }
            catch (errors) {
                _guiManager.getRegForm().clearErrors();
                _guiManager.getRegForm().addErrors([errors]);
            }
        }
        else {
            _guiManager.getRegForm().clearErrors();
            _guiManager.getRegForm().addErrors(validationResult.errorMessages);
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
        _regForm.clearErrors();
        _regForm.open();
    };

    let openLogin = function () {
        dark.style.display = "block";
        _regForm.hide();
        _loginForm.clearErrors();
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
            _loginForm.init(formValidationModule);
            _regForm = regForm;
            _regForm.init(formValidationModule);
        }
    };
})();