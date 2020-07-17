/**
 * 
 * Module which makes requests to server
 * Just sending and recieving data according server's api
 * 
 **/

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

    let setTokens = function (tokens) {
        sessionStorage.setItem("MAT", tokens.AccessToken);
        sessionStorage.setItem("MRT", tokens.RefreshToken);
        updateTokenTime(tokens.GenerationTime);              
    }

    let areTokensValid = function () {
        let token = sessionStorage.getItem("MAT");
        let refreshToken = sessionStorage.getItem("MRT");
        return token !== null && refreshToken !== null && token !== undefined && refreshToken !== undefined && token !== "" && refreshToken !== "";
    };

    let updateTokenTime = function (time) {
        let value = new Date(time).getTime();
        sessionStorage.setItem("ATGT", value);
        accessTokenGenerationTime = value;
    };

    let isTokenExpired = function () {
        return new Date().getTime() - accessTokenGenerationTime > 300000;
    };        

    let sendAjaxRequest = function (request) {        
        return $.ajax({
            url: request.url,
            type: request.type,
            contentType: "application/json",
            dataType: "json",
            data: request.type === "POST" ? JSON.stringify(request.data) : null            
        });
    }

    let sendAjaxAuthRequest = function (request) {
        return $.ajax({
            url: request.url,
            type: request.type,
            contentType: "application/json",
            dataType: "json",
            data: request.type === "POST" ? JSON.stringify(request.data) : null,
            beforeSend: function (xhr) {
                let token = sessionStorage.getItem("MAT");
                if (token !== undefined) {
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
                }
            }
        });
    };

    let sendRequest = async function (requestParams) {
        if (isTokenExpired()) {
            await refreshToken();           
        }
        return await sendAjaxAuthRequest(requestParams);
    }

    let refreshToken = async function () {
        let token = sessionStorage.getItem("MAT");
        let refreshToken = sessionStorage.getItem("MRT");
        if (areTokensValid() && isTokenExpired()) {
            let refreshDTO = {
                token: token,
                refreshToken: refreshToken,
                fingerprint: _fingerprint
            };
            try {
                let result = await sendAjaxRequest(new MaelstormRequest("/api/authentication/rfrshtkn", "POST", refreshDTO));                               
                if (result.isSuccessful) {
                    let tokens = JSON.parse(result.data);
                    setTokens(tokens);
                } else {
                    sessionStorage.removeItem("MAT");
                    sessionStorage.removeItem("MRT");                    
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

    let getErrorsFromJQXHR = function (JQXHR) {        
        let errorTypes = Object.keys(JQXHR.responseJSON.errors);
        let errors = [];
        for (let errorTypeIndex in errorTypes) {       
            let errorType = JQXHR.responseJSON.errors[errorTypes[errorTypeIndex]];
            for (let errorIndex in errorType) {
                errors.push(errorType[errorIndex]);
            }
        }        
        return errors;
    }

    return {
        init: function (fingerprint) {
            _fingerprint = fingerprint;
            accessTokenGenerationTime = Number(sessionStorage.getItem("ATGT"));
        },

        areTokensValid: areTokensValid,

        getDialogs: async function (offset, count) {
            return await sendRequest(new MaelstormRequest("/api/dialog/getdialogs?offset=" + offset + "&count=" + count));            
        },

        getReadedMessages: async function (dialogId, offset, count) {
            return await sendRequest(new MaelstormRequest("/api/dialog/getReadedDialogMessages?dialogId=" + dialogId + "&offset=" + offset + "&count=" + count, "GET"));            
        },

        getUnreadedMessages: async function (dialogId, offset, count) {
            return await sendRequest(new MaelstormRequest("/api/dialog/getUnreadedDialogMessages?dialogId=" + dialogId + "&offset=" + offset + "&count=" + count, "GET"));            
        },

        sendDialogMessage: async function (message) {
            if (message.targetId > 0) {
                if (!isEmptyOrSpaces(message.text)) {
                    if (message.text.length > 1 && message.text.length < 4096) {
                        return await  sendRequest(new MaelstormRequest("/api/dialog/sendmessage", "POST", message));
                    }
                    throw new Error("Invalid message length");
                }
                throw new Error("Text is empty");
            }
            throw new Error("Invalid target id");
        },

        login: async function (login, password) {            
            let model = {
                login: login,
                password: password,
                osCpu: getOS(),
                app: getBrowser(),
                fingerPrint: _fingerprint
            };            
            try {
                return await sendAjaxRequest(new MaelstormRequest("/api/authentication/auth", "POST", model));
            }
            catch (error) {                
                throw new Error(getErrorsFromJQXHR(error));
            }                  
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
            sendRequest(new MaelstormRequest("/api/session/closecurrentsession", "POST"));
            sessionStorage.clear();
        },

        getDialog: async function (interlocutorId) {
            return await sendRequest(new MaelstormRequest("/api/dialog/getdialog?interlocutorId=" + interlocutorId));            
        },

        getSessions: async function () {
            return await sendRequest(new MaelstormRequest("/api/session/getsessions", "GET"));            
        },

        closeSession: function (sessionId, banDevice) {
            let data = { sessionId: sessionId, banDevice: banDevice };
            sendRequest(new MaelstormRequest("/api/session/closeSession", "POST", data));
        },

        getOnlineStatuses: async function (ids) {
            if (ids.length !== 0)
                return await sendRequest(new MaelstormRequest("/api/session/getonlinestatuses", "POST", ids));
            throw new Error("Ids is empty");            
        },

        finsUserByLogin: async function (login) {
            if (!isEmptyOrSpaces(login)) {
                return await sendRequest(new MaelstormRequest("/api/finder/finduserbylogin?login=" + login));
            }                
            throw new error("Login is empty");
        },

        getUserInfo: async function (userId) {
            if (userId > 0)
                return await sendRequest(new MaelstormRequest("/api/user/getuserinfo?userId=" + userId));
            throw new Error("Invalid user id");            
        },

        setTokens: setTokens,

        findMessageAsync: async function (message) {
            if (!isEmptyOrSpaces(message))
                return await sendRequest(new MaelstormRequest("/api/finder/findmessage?message=" + message));
            throw new Error("Message is empty");    
        }
    };
})();