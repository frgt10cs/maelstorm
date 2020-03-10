var apiModule = (function () {
    var _fingerprint;

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
                fingerPrint: _fingerprpint
            });
            $.ajax({
                url: "/api/authentication/rfrshtkn",
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: refresh,
                success: function (data) {
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
        },

        areTokensValid: areTokensValid,

        getDialogs: function(stackNumber, handler) {
            sendRequest(new MaelstormRequest("/api/dialog/getdialogs?stackNumber=" + stackNumber, handler));
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
                        var tokens = JSON.parse(data.data);
                        localStorage.setItem("MAT", tokens.AccessToken);
                        localStorage.setItem("MRT", tokens.RefreshToken);
                        updateTokenTime(tokens.GenerationTime);
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
            sendRequest(new MaelstormRequest("/user/getonlinestatuses", handler, "POST", ids));
        }
    };
})();