//=========> registration
var nicknameField = document.getElementById("nickname");
var emailField = document.getElementById("email");
var passwordField = document.getElementById("password");
var passwordConfirmField = document.getElementById("confirmPassword");

document.getElementById("Registration").onclick = function () {
    var model = {
        nickname: nicknameField.value,
        email: emailField.value,
        password: passwordField.value,
        confirmpassword: passwordConfirmField.value
    };
    $.ajax({
        url: "account/registration",
        type: "POST",
        dataType: "application/json",
        data: JSON.stringify(model),
        success: function (data) {
            alert(data);
        }
    });
};