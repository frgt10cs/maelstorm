class DialogManager {
    constructor(dialogGuiManager, uploadMessagesCount) {
        this.dialogGuiManager = dialogGuiManager;
        this.openedDialog = null;
        this.dialogsStackNumber = 1;
        this.dialogs = [];
        this.uploadMessagesCount = uploadMessagesCount;  
        this.dialogGuiManager.mesSendBut.onclick = function () {
            this.openedDialog.SendMessage(this.dialogGuiManager.BuildMessage());
        };
        this.dialogGuiManager.messageBox.onkeydown = function (e) {
            if (e.keyCode === 13) {
                this.openedDialog.SendMessage(this.dialogGuiManager.BuildMessage());
                return false;
            }
        };
    }    

    AddDialog(maelstormDialog) {
        var dialog = new Dialog(maelstormDialog);
        this.dialogGuiManager.dialogsContainer.appendChild(dialog.element);
        this.messagesPanelsCotainer.appendChild(dialog.messagesPanel);
        dialogs.push(dialog);
    }

    UpdateDialogs(dialogs) {
        this.RemoveDialogs();
        for (var i = 0; i < dialogs.length; i++) {
            this.AddDialog(dialogs[i]);
        }
        this.dialogsStackNumber++;
    }

    RemoveDialogs() {
        while (this.dialogGuiManager.dialogsContainer.firstChild) {
            this.dialogGuiManager.dialogsContainer.firstChild.remove();
        }
        this.dialogs = [];
        this.dialogs.dialogsStackNumber = 1;
        this.openedDialog = null;
    }

    GetDialogByInterlocutorId(interlocutorId) {
        return this.dialogs.find(function (dialog) { return dialog.interlocutorId === interlocutorId; });
    }

    GetDialogById(id) {
        return this.dialogs.find(function (dialog) { return dialog.id === id; });
    }

    OpenDialog(dialog) {
        if (this.openedDialog === null || this.openedDialog.id !== dialog.id) {
            if (this.openedDialog !== null) {
                this.openedDialog.Close();                
            }
            if (!dialog.isPanelOpened) {
                FirstDialogMessagesUploading(dialog);
            }
            this.dialogGuiManager.SetDialog(dialog.title, dialog.status);
            dialog.Open();
            this.openedDialog = dialog;            
        }
    }

    IsDialogUploaded(interlocutorId) {
        var dialog = GetDialogByInterlocutorId(interlocutorId);
        return dialog !== null && dialog !== undefined;
    }

    CreateDialogDiv(dialog) {
        var element = document.createElement("div");
        element.classList.add("conversation");
        element.id = dialog.id;
        element.onclick = function () {
            this.OpenDialog(dialog);
        };
        var photoDiv = document.createElement("div");
        photoDiv.classList.add("conversationPhoto");
        photoDiv.style.backgroundImage = "url('/images/" + dialog.image + "')";
        var convPreview = document.createElement("div");
        convPreview.classList.add("conversationPreview");
        var convTitle = document.createElement("div");
        convTitle.classList.add("conversationTitle");
        convTitle.innerText = dialog.title;
        var convMessage = document.createElement("div");
        convMessage.classList.add("conversationMessage");
        var convText = document.createElement("div");
        convText.classList.add("conversationText");
        convText.innerText = dialog.lastMessageText !== null ? dialog.lastMessageText : "";
        var convDate = document.createElement("div");
        convDate.classList.add("conversationDate");
        convDate.innerText = dialog.lastMessageDate !== null ? GetDate(new Date(dialog.lastMessageDate)) : "";
        convMessage.appendChild(convText);
        convMessage.appendChild(convDate);
        convPreview.appendChild(convTitle);
        convPreview.appendChild(convMessage);
        element.appendChild(photoDiv);
        element.appendChild(convPreview);
        return element;
    }
}