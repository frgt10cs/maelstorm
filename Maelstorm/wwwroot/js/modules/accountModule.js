let accountModule = (function () {         
    let privateKey;    
    let publicKey;
    let _onLogin;    

    let login = async function () {
        let validationResult = loginFormModule.getDataValidationResult();
        if (validationResult.isSuccess) {
            try {
                let loginResult = await api.login(loginFormModule.getLogin(), loginFormModule.getPassword());                
                if (loginResult.isSuccessful) {
                    let result = JSON.parse(loginResult.data);                    
                    let IV = encodingModule.base64ToArray(result.IVBase64);

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

                    api.setTokens(result.Tokens);                    

                    loginFormModule.clearErrors();
                    accountGuiModule.hideAllForms();
                    _onLogin();
                }
                else {
                    loginFormModule.addErrors([loginResult.errorMessages]);
                }                
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
    let logoutBtn;
    let openLoginBtn,
        openRegistrationBtn,                
        dark;

    let openRegistration = function () {
        dark.style.display = "block";
        loginFormModule.hide();
        registrationFormModule.clearErrors();
        registrationFormModule.open();
    };

    let openLogin = function () {
        dark.style.display = "block";
        registrationFormModule.hide();
        loginFormModule.clearErrors();
        loginFormModule.open();
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