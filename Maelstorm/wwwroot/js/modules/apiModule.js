class MaelstormRequest {
    constructor(url, type, data) {
        this.url = url;        
        this.type = (type === undefined ? "GET" : type);
        this.data = data;
    }
}

let apiModule = (function () {
    let _fingerprint;

    let accessTokenGenerationTime;

    let areTokensValid = function () {
        let token = localStorage.getItem("MAT");
        let refreshToken = localStorage.getItem("MRT");
        return token !== null && refreshToken !== null && token !== undefined && refreshToken !== undefined && token !== "" && refreshToken !== "";
    };

    let updateTokenTime = function (time) {
        let value = new Date(time).getTime();
        localStorage.setItem("ATGT", value);
        accessTokenGenerationTime = value;
    };

    let isTokenExpired = function () {
        return new Date().getTime() - accessTokenGenerationTime > 300000;
    };

    let sendRequest = function (request) {
        return new Promise(function (resolve, reject) {
            if (!isTokenExpired()) {
                $.ajax({
                    url: request.url,
                    type: request.type,
                    contentType: "application/json",
                    dataType: "json",
                    data: request.type === "POST" ? JSON.stringify(request.data) : null,
                    beforeSend: function (xhr) {
                        let token = localStorage.getItem("MAT");
                        if (token !== undefined) {
                            xhr.setRequestHeader("Authorization", "Bearer " + token);
                        }
                    },
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (error) {
                        reject(error);
                    },
                    statusCode: {
                        401: function (xhr) {
                            if (xhr.getResponseHeader("Token-Expired")) {
                                refreshToken().then(() => {
                                    sendRequest(request).then(() => {
                                        resolve();
                                    }, error => {
                                        reject(error);
                                    });
                                }, error => {
                                    console.log(error); reject(error);
                                });
                            } else {
                                //
                            }
                        }
                    }
                });
            } else {
                refreshToken().then(() => {
                    sendRequest(request).then(() => {
                        resolve();
                    }, error => {
                        reject(error);
                    });
                }, error => {
                    reject(error);
                });
            }
        });        
    };

    let refreshToken = function () {
        return new Promise(function (resolve, reject) {
            let token = localStorage.getItem("MAT");
            let refreshToken = localStorage.getItem("MRT");
            if (areTokensValid() && isTokenExpired()) {
                let refresh = JSON.stringify({
                    token: token,
                    refreshtoken: refreshToken,
                    fingerPrint: _fingerprint
                });
                $.ajax({
                    url: "/api/authentication/rfrshtkn",
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: refresh,
                    success: function (data) {
                        console.log(data);
                        if (data.isSuccessful) {
                            let tokens = JSON.parse(data.data);
                            localStorage.setItem("MAT", tokens.AccessToken);
                            localStorage.setItem("MRT", tokens.RefreshToken);
                            updateTokenTime(tokens.GenerationTime);
                            resolve();
                        } else {
                            localStorage.removeItem("MAT");
                            localStorage.removeItem("MRT");
                            reject(new Error("Token refreshing error: " + data.errorMessages.join(' ')))                                                        
                            //
                        }
                    }
                });
            }
        });        
    };

    let isEmptyOrSpaces = function (str) {
        return str === null || str.match(/^ *$/) !== null;
    }; 

    let getOS = function () {
        let userAgent = window.navigator.userAgent;
        let platform = window.navigator.platform;
        let macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
        let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        let iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        let os = "Unknown";

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

    let getBrowser = function () {
        let ua = navigator.userAgent,
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
        init: function (fingerprint) {
            _fingerprint = fingerprint;
            accessTokenGenerationTime = Number(localStorage.getItem("ATGT"));
        },

        areTokensValid: areTokensValid,

        getDialogs: function (offset, count) {
            return new Promise(function (resolve, reject) {
                sendRequest(new MaelstormRequest("/api/dialog/getdialogs?offset=" + offset + "&count=" + count)).then(dialogs => {
                    resolve(dialogs);
                }, (error) => {
                    reject(error);
                });
            });
        },

        getReadedMessages: function (dialogId, offset, count) {
            return new Promise(function (resolve, reject) {
                sendRequest(new MaelstormRequest("/api/dialog/getReadedDialogMessages?dialogId=" + dialogId + "&offset=" + offset + "&count=" + count, "GET")).then(messages => {
                    resolve(messages);
                }, error => {
                    reject(error);
                });
            })
        },

        getUnreadedMessages: function (dialogId, count) {
            return new Promise(function (resolve, reject) {
                sendRequest(new MaelstormRequest("/api/dialog/getUnreadedDialogMessages?dialogId=" + dialogId + "&offset=" + offset + "&count=" + count, "GET")).then(messages => {
                    resolve(messages);
                }, error => {
                    reject(error);
                });
            })
        },

        sendDialogMessage: function (message, onSuccessful) {
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

        login: function (login, password) {
            return new Promise(function (resolve, reject) {
                let model = {
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
                            let result = JSON.parse(data.data);
                            localStorage.setItem("MAT", result.Tokens.AccessToken);
                            localStorage.setItem("MRT", result.Tokens.RefreshToken);
                            localStorage.setItem("IV", result.IVBase64);
                            console.log(result.EncryptedPrivateKey);
                            updateTokenTime(result.Tokens.GenerationTime);
                            resolve();
                        } else {
                            reject(data.errorMessages);
                        }
                    }
                });
            });
        },

        registration: function (nickname, email, password, confirmPassword) {
            return new Promise(function (resolve, reject) {
                if (!isEmptyOrSpaces(nickname) && !isEmptyOrSpaces(email) && !isEmptyOrSpaces(password) && !isEmptyOrSpaces(confirmPassword)) {
                    if (password === confirmPassword) {
                        let model = {
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
                                    resolve();
                                }
                                else {
                                    reject(data.errorMessages);
                                }
                            }
                        });
                    }
                }
            });
        },

        logOut: function () {
            sendRequest(new MaelstormRequest("/api/user/logout", "GET"));
            localStorage.clear();
        },

        getDialog: function (interlocutorId) {
            return new Promise(function (resolve, reject) {
                sendRequest(new MaelstormRequest("/api/dialog/getdialog?interlocutorId=" + interlocutorId)).then(dialog => {
                    resolve(dialog);
                }, error => {
                    reject(error);
                });
            });
        },

        getSessions: function () {
            return new Promise(function (resolve, reject) {
                sendRequest(new MaelstormRequest("/api/user/getsessions", "GET")).then(sessions => {
                    resolve(sessions);
                }, error => {
                    reject(error);
                });
            });
        },

        closeSession: function (sessionId, banDevice) {
            let data = { sessionId: sessionId, banDevice: banDevice };
            sendRequest(new MaelstormRequest("/api/user/closeSession", "POST", data));
        },

        getOnlineStatuses: function (ids) {
            return new Promise(function (resolve, reject) {
                if (ids.length === 0) reject();
                sendRequest(new MaelstormRequest("/api/user/getonlinestatuses", "POST", ids)).then(statuses => {
                    resolve(statuses);
                }, error => {
                    reject(error);
                });
            });
        },

        findByNickname: function (nickname) {
            return new Promise(function(resolve, reject){
                sendRequest(new MaelstormRequest("/api/finder/finduser?nickname=" + nickname).then(user => {
                    resolve(user);
                }, error => {
                    reject(error);
                }));
            });
        },

        getUserInfo: function (userId) {
            return new Promise(function (resolve, reject) {
                sendRequest(new MaelstormRequest("/api/user/getuserinfo?userId=" + userId).then(user => {
                    resolve(user);
                }, error => {
                    reject(error);
                }));
            });           
        }
    };
})();