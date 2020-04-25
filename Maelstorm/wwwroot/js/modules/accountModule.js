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
                _guiManager.hideAllForms();
                _onLogin();
            }
            catch (errors) {                
                console.log(errors);
                _guiManager.getLoginForm().setLoginStatus(errors.message);                
            }
        }
        else {
            
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

let formValidationModule = (function () {
    let isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
    }; 

    let validationResult = function (isSuccess, errorMessages) {
        return { isSuccess: isSuccess, errorMessages: errorMessages }
    }

    return {
        isEmailValid: function(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(String(email).toLowerCase())) {
                if (email.length > 10 && email.length < 30)
                    return validationResult(true);
                return validationResult(false, ["Invalid email length"]);
            }
            return validationResult(false, ["Is not email"]);
        },

        isLoginValid: function (login) {           
            if (!isEmptyOrSpaces(login)) {
                if (login.length > 3 && login.length < 20) {
                    return validationResult(true);
                }
                return validationResult(false, ["Invalid login length"]);
            }
            return validationResult(false, ["Login is empty"]);
        },

        isPasswordValid(password) {
            if (!isEmptyOrSpaces(password)) {
                if (password.length > 3 && password.length < 20 ) {
                    return validationResult(true);
                }
                return validationResult(false, ["Invalid password length"]);
            }
            return validationResult(false, ["Password is empty"]);
        }        
    }
});

let loginFormModule = (function () {

    let form;
    let loginTextBox,
        passwordTextBox,
        loginBtn,
        statusDiv;   
    let _formValidation;

    return {
        init: function (formValidationModule) {
            _formValidation = formValidationModule;
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

        getDataValidationResult: function () {
            let validationResult = {isSuccess: true,  errorMessages: [] };
            let validationResults = [_formValidation.isLoginValid(loginField.value), _formValidation.isPasswordsValid(passwordField.value)];
            for (let i in validationResults) {
                if (!validationResults[i])
                    validationResult.errorMessages.concat(validationResults[i].errorMessages);
            }
            validationResult.isSuccess = validationResult.errorMessages.length === 0;
        },

        setLoginStatus: function (value) { statusDiv.innerText = value; }
    };
}());

let registrationFormModule = (function () {
    let form;
    let loginTextBox,
        emailTextBox,
        passwordTextBox,
        passwordConfirmTextBox,
        regBtn,
        statusDiv;    
    let _formValidation;

    return {
        init: function (formValidationModule) {
            _formValidation = formValidationModule;
            form = document.getElementById("regForm");
            loginTextBox = document.getElementById("regLogin");
            emailTextBox = document.getElementById("regEmail");
            passwordTextBox = document.getElementById("regPassword");
            passwordConfirmTextBox = document.getElementById("regPasswordConfirm");
            regBtn = document.getElementById("regBtn");
            statusDiv = document.getElementById("regStatus");
        },
        getLogin: function () { return loginTextBox.value; },
        getEmail: function () { return emailTextBox.value; },
        getPassword: function () { return passwordTextBox.value; },
        getPasswordConfirm: function () { return passwordConfirmTextBox.value; },
        getSubmitButton: function () { return regBtn; },
        hide: function () { form.style.display = "none"; },
        open: function () { form.style.display = "block"; },
        getDataValidationResult: function () {
            let validationResult = { isSuccess: true, errorMessages: [] };
            let validationResults = [_formValidation.isLoginValid(loginTextBox.value), _formValidation.isEmailValid(emailTextBox), _formValidation.isPasswordsValid(passwordTextBox.value),
            _formValidation.isPasswordsValid(passwordConfirmTextBox.value)];
            for (let i in validationResults) {
                if (!validationResults[i])
                    validationResult.errorMessages.concat(validationResults[i].errorMessages);
            }
            validationResult.isSuccess = validationResult.errorMessages.length === 0;        
        },
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
            _loginForm.init(formValidationModule);
            _regForm = regForm;
            _regForm.init(formValidationModule);
        }
    };
})();