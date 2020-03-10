class ConnectionGuiManager{
    constructor() {
        this.connectingInfo = document.getElementById("connecting");
        this.connectedInfo = document.getElementById("connected");
        this.disconnectedInfo = document.getElementById("disconnected");        
    }

    ShowConnecting() {
        this.connectingInfo.style.display = "flex";        
    }

    HideConnectInfo() {
        this.connectingInfo.style.display = "none";
        this.connectedInfo.style.display = "none";
    }

    ShowConnected() {
        this.connectedInfo.style.display = "flex";
        this.connectingInfo.style.display = "none";
        setTimeout(function () {
            this.connectedInfo.style.display = "none";
        }, 2500);
    }

    ShowDisconnected() {
        this.HideConnectInfo();
        this.disconnectedInfo.style.display = "flex";
    }   
}