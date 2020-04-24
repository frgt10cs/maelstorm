class MaelstormRequest {
    constructor(url, type, data) {
        this.url = url;        
        this.type = (type === undefined ? "GET" : type);
        this.data = data;
    }
}

let apiModule = (function () {
    let _fingerprint;
    let _crypto;
    let userPrivateKey;    
    let userAesKey;

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

    let request = function(){
        return $.ajax({
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
        })
    }

    let sendRequest = async function (request) {
        if (!isTokenExpired()) {
            try {
                let result = await $.ajax({
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
                    statusCode: {
                        401: async function (xhr) {
                            if (xhr.getResponseHeader("Token-Expired")) {
                                try {
                                    let refreshResult = await refreshToken();
                                    console.log(refreshResult);
                                }
                                catch (error) {
                                    console.log(error);
                                }                                
                            } else {
                                //
                            }
                        }
                    }
                });
                console.log(result);
                return result;
            }
            catch (error) {
                console.log(error);
                throw new Error("");
            }
        } else {
            //refreshToken().then(() => {
            //    sendRequest(request).then(() => {
            //        resolve();
            //    }, error => {
            //        reject(error);
            //    });
            //}, error => {
            //    reject(error);
            //});
        }    
    };

    let refreshToken = async function () {
        let token = localStorage.getItem("MAT");
        let refreshToken = localStorage.getItem("MRT");
        if (areTokensValid() && isTokenExpired()) {
            let refresh = JSON.stringify({
                token: token,
                refreshtoken: refreshToken,
                fingerPrint: _fingerprint
            });
            try {
                let result = await $.ajax({
                    url: "/api/authentication/rfrshtkn",
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: refresh
                });
                console.log(result);
                if (result.isSuccessful) {
                    let tokens = JSON.parse(result.data);
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
            catch (error) {
                console.log(error);
                throw new Error(error);
            }
        }        
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

    let loginRequest = function () {

    };

    //let decryptMessages = function (dialogKey, messages) {
    //    let promises = [];
    //    for (let i = 0; i < messages.length; i++) {
    //        promises.push(_crypto.decryptAes(dialogKey, messages[i].IV, messages[i]));
    //    }
    //    return Promise.all(promises);                    
    //}

    return {
        init: function (fingerprint, crypto, encoding) {
            _fingerprint = fingerprint;
            _crypto = crypto;
            _encoding = encoding;
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

        login: async function (login, password) {
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
            }).done(async function (data) {
                if (data.isSuccessful) {
                    let result = JSON.parse(data.data);
                    localStorage.setItem("MAT", result.Tokens.AccessToken);
                    localStorage.setItem("MRT", result.Tokens.RefreshToken);
                    updateTokenTime(result.Tokens.GenerationTime);
                    let IV = _encoding.base64ToArray(result.IVBase64);
                    userAesKey = await _crypto.genereateAesKeyByPassPhrase(password, 128);
                    userPrivateKey = await _crypto.decryptAes(userAesKey, IV, result.EncryptedPrivateKey);
                } else {
                    throw new Error(data.errorMessages[0]);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                throw new Error(textStatus);
            });
        },

        registration: async function (nickname, email, password, confirmPassword) {
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
                        dataType: "json"
                    }).done(function (data) {
                        if (!data.isSuccessful) {
                            throw new Error(data.errorMessages[0]);
                        }
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        throw new Error(textStatus);
                    });
                }
                else {
                    throw new Error("Passwords are not same");
                }
            }
            else {
                throw new Error("Invalid data");
            }
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