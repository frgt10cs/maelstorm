let accountModule = (function () {         
    let privateKey;    
    let publicKey;
    let _onLogin;    

    let login = async function () {
        loginFormModule.clearErrors();
        let validationResult = loginFormModule.getDataValidationResult();        
        if (validationResult.isSuccess) {
            try {
                accountGuiModule.setLoginProcessText("Logging in");
                accountGuiModule.showLoginProcess();
                let loginResult = await api.login(loginFormModule.getLogin(), loginFormModule.getPassword());                
                if (loginResult.isSuccessful) {
                    accountGuiModule.setLoginProcessText("Parsing data");
                    let result = JSON.parse(loginResult.data);                    
                    let IV = encodingModule.base64ToArray(result.IVBase64);
                    accountGuiModule.setLoginProcessText("Generating keys");

                    userAesKey = await cryptoModule.genereateAesKeyByPassPhrase(loginFormModule.getPassword(), encodingModule.base64ToArray(result.KeySaltBase64), 128);                     
                    publicKey = await window.crypto.subtle.importKey(
                        "spki",
                        encodingModule.base64ToArray(result.PublicKey),
                        {
                            name: "RSA-OAEP",
                            hash: "SHA-256"
                        },
                        true,
                        ["encrypt"]
                    );

                    let publicKeyExport = await window.crypto.subtle.exportKey("jwk", publicKey);
                    let exponent = encodingModule.base64UrlDecode(publicKeyExport.e);                    
                
                    let privateKeyBytes = await cryptoModule.decryptAes(userAesKey, IV, result.EncryptedPrivateKey);                    
                    privateKey = await window.crypto.subtle.importKey(
                        "pkcs8",
                        privateKeyBytes,
                        {
                            name: "RSA-OAEP",
                            modulusLength: 2048,
                            publicExponent: exponent,
                            hash: "SHA-256",
                        },
                        false,
                        ["decrypt"]
                    );

                    accountGuiModule.setLoginProcessText("Settings tokens");
                    api.setTokens(result.Tokens);                    

                    accountGuiModule.setLoginProcessText("Finishing");
                    loginFormModule.clearErrors();                    
                    layoutGuiModule.showNavOptions();
                    accountGuiModule.hideAllForms();                    
                    _onLogin();
                }
                else {                    
                    loginFormModule.addErrors([loginResult.errorMessages]);
                }  
                accountGuiModule.hideLoginProcess();
            }
            catch (errors) {                  
                loginFormModule.addErrors([errors]);
            }
        }
        else {            
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
        closeSession();               
    };

    /**
     * Removes all data,
     * closes all opened windows
     * and closes connections    
     * */
    let closeSession = function () {
        dialogsModule.removeDialogs();
        signalRModule.refreshConnectionData();
        sessionGuiModule.clearSessionsContainer();
        sessionStorage.clear();
        localStorage.clear();        
        settingsGuiModule.closeSettingsContainer();
        layoutGuiModule.hideNavOptions();
        accountGuiModule.openLogin();
    }

    return {
        init: function (onLogin) {
            accountGuiModule.init();
            loginFormModule.getSubmitButton().onclick = login;
            registrationFormModule.getSubmitButton().onclick = registration;
            accountGuiModule.getLogoutBtn().onclick = logout;    
            _onLogin = onLogin;
        },

        closeSession: closeSession,

        getPrivateKey: function () {
            return privateKey;
        },

        getPublicKey: function () {
            return publicKey;
        }
    };
})();

let accountGuiModule = (function () {
    let logoutBtn;
    let openLoginBtn,
        openRegistrationBtn; 
    let loginProcessInfo,
        loginProcessText;

    let openRegistration = function () {
        layoutGuiModule.showDark();
        loginFormModule.hide();
        registrationFormModule.clearErrors();
        registrationFormModule.open();
    };

    let openLogin = function () {
        layoutGuiModule.showDark();
        registrationFormModule.hide();
        loginFormModule.clearErrors();
        loginFormModule.open();
    };

    return {                
        getLogoutBtn: function () { return logoutBtn; },
        openLogin: openLogin,
        openRegistration: openRegistration,

        hideAllForms: function () {
            layoutGuiModule.hideDark();
            loginFormModule.hide();
            registrationFormModule.hide();
        },

        init: function () {
            openLoginBtn = document.getElementById("openLogin");
            openLoginBtn.onclick = function () { openLogin(); };
            openRegistrationBtn = document.getElementById("openReg");
            openRegistrationBtn.onclick = function () { openRegistration(); };
            logoutBtn = document.getElementById("logoutButton");
            loginProcessInfo = document.getElementById("loginProcessInfo");
            loginProcessText = document.getElementById("loginProcessText");
            loginFormModule.init(formValidationModule)
            registrationFormModule.init(formValidationModule);            
        },

        showLoginProcess: function () {
            loginProcessInfo.style.display = "flex";
        },

        hideLoginProcess: function () {
            loginProcessInfo.style.display = "none";
        },

        setLoginProcessText: function (text) {
            loginProcessText.innerText = text + "...";
        }
    };
})();