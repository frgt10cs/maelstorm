class DialogGuiManager {
    constructor() {
        this.dialogsContainer = document.getElementById("dialogs");
        this.dialogTitleDiv = document.getElementById("conversationTitle");
        this.dialogStatusDiv = document.getElementById("conversationStatus");
        this.messagesPanelsContainer = document.getElementById("panelsInner");
        this.uploadingInfo = document.getElementById("uploading");
        this.messageBox = document.getElementById("mesInput");
        this.mesSendBut = document.getElementById("mesSendBut");
        this.dark = document.getElementById("dark");
    }    

    SetDialog(title, status) {
        this.dialogTitleDiv.innerText = title;
        this.dialogStatusDiv.innerText = status;
    }

    ShowUploading() {
        this.dark.style.display = "block";
        this.uploadingInfo.style.display = "flex";
    }

    HideUploading() {
        this.dark.style.display = "none";
        this.uploadingInfo.style.display = "none";
    }
}