class SignalRConnection {
    constructor(api, fingerprint, url, dialogManager, connectionGuiManager, OnConnecting, OnConnected, OnDisconnected) {
        this.api = api;
        this.timeToReconnect = [0, 2000, 2000, 4000, 6000];
        this.tryReconnectingCount = -1;        
        this.isClosedByClient = false;
        this.pingTime = null;
        this.connection = new signalR.HubConnectionBuilder().withUrl(url).configureLogging(signalR.LogLevel.None).build();
        this.url = url;
        this.fingerprint = fingerprint;
        this.OnConnecting = OnConnecting;
        this.OnConnected = OnConnected;        
        this.OnDisconnected = OnDisconnected;
        this.dialogManager = dialogManager;        
        this.connectionGuiManager = connectionGuiManager;
        this.InitHandlers();
    }

    StartConnection() {
        if (this.connection !== null && this.fingerprint !== "" && this.connection.connectionState !== 1) {
            this.Connecting();
            this.connection.start()
                .then(this.Connected)
                .catch(function (error) {
                    console.log("error on connecting");
                    this.tryReconnectingCount+=1;
                    if (this.tryReconnectingCount < this.timeToReconnect.length)
                        setTimeout(() => StartConnection(), this.timeToReconnect[this.tryReconnectingCount]);
                    else {
                        this.Disconnected();
                    }
                });
        } else {            
            this.Connected();
        }
    }

    Auth() {
        this.connection.invoke("Authorize", localStorage.getItem("MAT"), this.fingerprint);
    }   

    Ping() {
        if (this.connection.connectionState === 1) {
            this.pingTime = new Date();
            this.connection.invoke("Ping");
        } else {
            console.log("Disconnected");
        }
    }

    InitHandlers() {
        this.connection.onclose(() => {
            if (this.isClosedByClient || this.fingerprint === "") return;
            console.log("lost connection");
            this.StartConnection();
        });

        this.connection.on("Ping", function (isAuth) {
            console.log("PONG, " + (isAuth ? "mister" : "anonym"));
            console.log("Ping: " + (new Date().getMilliseconds() - this.pingTime.getMilliseconds()));
        });

        this.connection.on("RecieveMessage", function (serverMessage) {
            var sm = JSON.parse(serverMessage);
            var message = new Message(sm.id, sm.dialogId, sm.authorId, sm.text, sm.replyId, sm.status, sm.dateOfSending);
            var dialog = this.dialogManager.GetDialogById(message.dialogId);
            if (dialog !== undefined && dialog !== null) {
                dialog.AddNewMessage(message);
            } else {
                this.api.GetDialog(message.authorId, function (dialog) {
                    this.dialogManager.AddDialog(dialog);
                    dialog.AddNewMessage(message);
                });
            }
        });

        this.connection.on("MessageWasReaded", function (dialogId, messageId) {
            var dialog = this.dialogManager.GetDialogById(dialogId);
            if (dialog !== undefined) {
                var messages = dialog.messages;
                for (var i = messages.length; i > 0; i--) {
                    if (messages[i].id === messageId) {
                        SetAsReaded(messages[i].element.firstChild);//!!
                        console.log("man read: " + messages[i].text);
                        break;
                    }
                }
            }
        });

        this.connection.on("OnHubAuthFalied", function () {
            alert("Auth failed");
        });

        this.connection.on("OnSessionClosed", function () {
            localStorage.clear();
            this.isClosedByClient = true;
            this.connection.stop();
            this.accountManager.OpenLogin();
        });    
    }

    Connected() {
        console.log("Connected");
        this.tryReconnectingCount = -1;
        this.connectionGuiManager.ShowConnected();
        this.Auth();
        this.onConnected();
    }

    Connecting() {
        console.log("connecting...");        
        this.connectionGuiManager.ShowConnecting();
        this.OnConnecting();        
    }

    Disconnected() {        
        this.connectionGuiManager.ShowDisconnected();
        this.OnDisconnected();
    }
}