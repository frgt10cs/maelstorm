let accountModule = (function () {         
    let privateKey;    
    let _onLogin;

    let login = async function () {
        let validationResult = loginFormModule.getDataValidationResult();
        if (validationResult.isSuccess) {
            try {
                let loginResult = await api.login(loginFormModule.getLogin(), loginFormModule.getPassword());
                if (loginResult.isSuccessful) {
                    let result = JSON.parse(loginResult.data);
                    localStorage.setItem("MAT", result.Tokens.AccessToken);
                    localStorage.setItem("MRT", result.Tokens.RefreshToken);
                    updateTokenTime(result.Tokens.GenerationTime);
                    let IV = encodingModule.base64ToArray(result.IVBase64);

                    userAesKey = await cryptoModule.genereateAesKeyByPassPhrase(password, encodingModule.base64ToArray(result.KeySaltBase64), 128);                    
                    let privateKey = await cryptoModule.decryptAes(userAesKey, IV, result.EncryptedPrivateKey);
                    userAesKey = ...;
                }
                loginFormModule.clearErrors();
                accountGuiModule.hideAllForms();
                _onLogin();
            }
            catch (errors) {  
                loginFormModule.clearErrors();
                loginFormModule.addErrors([errors]);
            }
        }
        else {
            loginFormModule.clearErrors();
            loginFormModule.addErrors(validationResult.errorMessages);
        }
    };

    let registration = async function () {
        let validationResult = registrationFormModule.getDataValidationResult();
        if (validationResult.isSuccess) {
            try {
                await api.registration(registrationFormModule.getLogin(),
                    registrationFormModule.getEmail(),
                    registrationFormModule.getPassword(),
                    registrationFormModule.getPasswordConfirm());
                registrationFormModule.clearErrors();
                accountGuiModule.openLogin();
            }
            catch (errors) {
                registrationFormModule.clearErrors();
                registrationFormModule.addErrors([errors]);
            }
        }
        else {
            registrationFormModule.clearErrors();
            registrationFormModule.addErrors(validationResult.errorMessages);
        }
    };

    let logout = function () {
        api.logOut();
        accountGuiModule.openLogin();
    };

    return {
        init: function (onLogin) {
            accountGuiModule.init();
            loginFormModule.getSubmitButton().onclick = login;
            registrationFormModule.getSubmitButton().onclick = registration;
            accountGuiModule.getLogoutBtn().onclick = logout;    
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
        getLogoutBtn: function () { return logoutBtn; },
        openLogin: openLogin,
        openRegistration: openRegistration,

        hideAllForms: function () {
            dark.style.display = "none";
            loginFormModule.hide();
            registrationFormModule.hide();
        },

        init: function () {
            openLoginBtn = document.getElementById("openLogin");
            openLoginBtn.onclick = function () { openLogin(); };
            openRegistrationBtn = document.getElementById("openReg");
            openRegistrationBtn.onclick = function () { openRegistration(); };
            logoutBtn = document.getElementById("logoutButton");            
            dark = document.getElementById("dark");
            loginFormModule.init(formValidationModule)
            registrationFormModule.init(formValidationModule);            
        }
    };
})();