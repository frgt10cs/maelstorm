let signalRModule = (function () {
    let url = "/messageHub";
    let connection;
    let timeToReconnect;
    let tryReconnectingCount;
    let isClosedByClient;
    let pingTime;
    let _api;
    let _fingerprint;
    let _dialogs;
    let _connectionGui;
    let _accountGui;    

    let auth = function () {
        connection.invoke("Authorize", localStorage.getItem("MAT"), _fingerprint);
    };   

    let startConnection = function () {
        if (connection !== null && _fingerprint !== "" && connection.connectionState !== 1) {
            connecting();
            connection.start()
                .then(connected)
                .catch(function (error) {
                    console.log("error on connecting");
                    tryReconnectingCount += 1;
                    if (tryReconnectingCount < timeToReconnect.length)
                        setTimeout(() => startConnection(), timeToReconnect[tryReconnectingCount]);
                    else {
                        disconnected();
                    }
                });
        } else {
            connected();
        }
    };

    let initHandlers = function () {
        connection.onclose(() => {
            if (isClosedByClient || _fingerprint === "") return;
            console.log("lost connection");
            startConnection();
        });

        connection.on("Ping", function (isAuth) {
            console.log("PONG, " + (isAuth ? "mister" : "anonym"));
            console.log("Ping: " + (new Date().getMilliseconds() - pingTime.getMilliseconds()));
        });

        connection.on("RecieveMessage", function (serverMessage) {
            let sm = JSON.parse(serverMessage);
            let message = new Message(sm.id, sm.dialogId, sm.authorId, sm.text, sm.replyId, sm.status, sm.dateOfSending);
            let dialog = _dialogs.getDialogById(message.dialogId);
            if (dialog !== undefined && dialog !== null) {
                dialog.addNewMessage(message);
            } else {
                _api.getDialog(message.authorId, function (dialog) {
                    _dialogs.addDialog(dialog);
                    _dialog.addNewMessage(message);
                });
            }
        });

        connection.on("MessageWasReaded", function (dialogId, messageId) {
            let dialog = _dialogs.getDialogById(dialogId);
            if (dialog !== undefined) {
                let messages = dialog.messages;
                for (let i = messages.length; i > 0; i--) {
                    if (messages[i].id === messageId) {
                        SetAsReaded(messages[i].element.firstChild);//!!
                        console.log("man read: " + messages[i].text);
                        break;
                    }
                }
            }
        });

        connection.on("OnHubAuthFalied", function () {
            alert("Auth failed");
        });

        connection.on("OnSessionClosed", function () {
            localStorage.clear();
            isClosedByClient = true;
            connection.stop();
            _accountGui.openLogin();
        });
    };

    let connected = function () {
        console.log("connected");
        tryReconnectingCount = -1;
        _connectionGui.showConnected();
        auth();        
    };

    let connecting = function () {
        console.log("connecting...");
        _connectionGui.showConnecting();        
    };

    let disconnected = function () {
        console.log("disconnected");
        _connectionGui.showDisconnected();
    };

    return {
        init: function (api, fingerprint, dialogsModule, connectionGui, accountGui) {
            _api = api;
            _fingerprint = fingerprint;
            _dialogs = dialogsModule;
            _connectionGui = connectionGui;
            _accountGui = accountGui;
            timeToReconnect = [0, 2000, 2000, 4000, 6000];
            tryReconnectingCount = -1;
            isClosedByClient = false;
            pingTime = null;
            connection = new signalR.HubConnectionBuilder()
                .withUrl(url).configureLogging(signalR.LogLevel.None).build();
            initHandlers();
        },

        startConnection: startConnection,

        ping: function () {
            if (connection.connectionState === 1) {
                pingTime = new Date();
                connection.invoke("Ping");
            } else {
                console.log("Disconnected");
            }
        }        
    };
})();

let connectionGuiModule = (function () {
    let connectingInfo;
    let connectedInfo;
    let disconnectedInfo;

    let hideConnectInfo = function () {
        connectingInfo.style.display = "none";
        connectedInfo.style.display = "none";
    };

    return {
        init: function () {
            connectingInfo = document.getElementById("connecting");
            connectedInfo = document.getElementById("connected");
            disconnectedInfo = document.getElementById("disconnected"); 
        },

        showConnecting: function () {
            connectingInfo.style.display = "flex";        
        },

        hideConnectInfo: hideConnectInfo,

        showConnected: function () {
            connectedInfo.style.display = "flex";
            connectingInfo.style.display = "none";
            setTimeout(function () {
                connectedInfo.style.display = "none";
            }, 2500);
        },

        showDisconnected: function () {
            hideConnectInfo();
            disconnectedInfo.style.display = "flex";
        }
    };
})();