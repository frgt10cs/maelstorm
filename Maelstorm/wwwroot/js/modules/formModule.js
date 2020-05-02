let formValidationModule = (function () {
    let isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
    };

    let validationResult = function (isSuccess, errorMessages) {
        return { isSuccess: isSuccess, errorMessages: errorMessages }
    }

    return {
        isEmailValid: function (email) {
            if (email.length > 10 && email.length < 30) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (re.test(String(email).toLowerCase())) {
                    return validationResult(true);
                }
                return validationResult(false, ["Is not email"]);
            }                                        
            return validationResult(false, ["Invalid email length"]);            
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
                if (password.length > 3 && password.length < 20) {
                    return validationResult(true);
                }
                return validationResult(false, ["Invalid password length"]);
            }
            return validationResult(false, ["Password is empty"]);
        }
    }
})();

let loginFormModule = (function () {

    let form;
    let loginTextBox,
        passwordTextBox,
        loginBtn,
        errorsContainer;
    let _formValidation;

    return {
        init: function (formValidation) {
            _formValidation = formValidation;
            form = document.getElementById("loginForm");
            loginTextBox = document.getElementById("login");
            passwordTextBox = document.getElementById("password");
            loginBtn = document.getElementById("loginBtn");
            errorsContainer = document.getElementById("loginErrorsContainer");
        },
        getLogin: function () { return loginTextBox.value; },
        getPassword: function () { return passwordTextBox.value; },
        getSubmitButton: function () { return loginBtn; },
        hide: function () { form.style.display = "none"; },
        open: function () { form.style.display = "block"; },

        getDataValidationResult: function () {
            let validationResult = { isSuccess: true, errorMessages: [] };
            let validationResults = [_formValidation.isLoginValid(loginTextBox.value), _formValidation.isPasswordValid(passwordTextBox.value)];
            for (let i in validationResults) {
                if (!validationResults[i].isSuccess) {
                    validationResult.errorMessages = validationResult.errorMessages.concat(validationResults[i].errorMessages);
                }
            }
            validationResult.isSuccess = validationResult.errorMessages.length === 0;
            return validationResult;
        },

        addErrors: function (errors) {
            for (let i in errors) {
                let element = document.createElement("div");
                element.className = "formError";
                element.innerText = errors[i];
                errorsContainer.appendChild(element);
            }
        },

        clearErrors: function () {
            while (errorsContainer.lastElementChild) {
                errorsContainer.removeChild(errorsContainer.lastElementChild);
            }
        }
    };
}());

let registrationFormModule = (function () {
    let form;
    let loginTextBox,
        emailTextBox,
        passwordTextBox,
        passwordConfirmTextBox,
        regBtn,
        errorsContainer;
    let _formValidation;

    return {
        init: function (formValidation) {
            _formValidation = formValidation;
            form = document.getElementById("regForm");
            loginTextBox = document.getElementById("regLogin");
            emailTextBox = document.getElementById("regEmail");
            passwordTextBox = document.getElementById("regPassword");
            passwordConfirmTextBox = document.getElementById("regPasswordConfirm");
            regBtn = document.getElementById("regBtn");
            errorsContainer = document.getElementById("regErrorsContainer");
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
            let validationResults = [_formValidation.isLoginValid(loginTextBox.value), _formValidation.isEmailValid(emailTextBox.value), _formValidation.isPasswordValid(passwordTextBox.value),
            _formValidation.isPasswordValid(passwordConfirmTextBox.value)];
            for (let i in validationResults) {
                if (!validationResults[i].isSuccess)
                    validationResult.errorMessages = validationResult.errorMessages.concat(validationResults[i].errorMessages);
            }
            if (passwordTextBox.value !== passwordConfirmTextBox.value)
                validationResult.errorMessages.push("passwords are not same");
            validationResult.isSuccess = validationResult.errorMessages.length === 0;
            return validationResult;
        },

        addErrors: function (errors) {
            for (let i in errors) {
                let element = document.createElement("div");
                element.className = "formError";
                element.innerText = errors[i];
                errorsContainer.appendChild(element);
            }
        },

        clearErrors: function () {
            while (errorsContainer.lastElementChild) {
                errorsContainer.removeChild(errorsContainer.lastElementChild);
            }
        }
    };
})();