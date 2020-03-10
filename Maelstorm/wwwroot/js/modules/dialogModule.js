var dialogModule = (function () {
    var _guiManager;
    var uploadCount;
    var openedDialog;
    var dialogs;
    var dialogsStackNumber;
    var messagesPanelsContainer;            

    var removeDialogs = function () {
        while (_guiManager.getDialogsContainer().firstChild) {
            _guiManager.getDialogsContainer().firstChild.remove();
        }
        dialogs = [];
        dialogsStackNumber = 1;
        openedDialog = null;
    };     

    var createDialogDiv = function (dialog) {
        var element = document.createElement("div");
        element.classList.add("conversation");
        element.id = dialog.id;
        element.onclick = function () {
            openDialog(dialog);
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
        convDate.innerText = dialog.lastMessageDate !== null ? getDate(new Date(dialog.lastMessageDate)) : "";
        convMessage.appendChild(convText);
        convMessage.appendChild(convDate);
        convPreview.appendChild(convTitle);
        convPreview.appendChild(convMessage);
        element.appendChild(photoDiv);
        element.appendChild(convPreview);
        return element;
    };

    var addDialog = function (serverDialog) {
        var dialog = new Dialog(serverDialog);
        _guiManager.getDialogsContainer().appendChild(dialog.element);
        messagesPanelsContainer.appendChild(dialog.messagesPanel);
        dialogs.push(dialog);
    };

    return {

        init: function (guiManager, uploadMessagesCount) {
            _guiManager = guiManager;
            uploadCount = uploadMessagesCount;
            openedDialog = null;
            dialogs = [];
            dialogsStackNumber = 1;
            messagesPanelsContainer = [];
        },

        getDialogById: function (id) {
            return dialogs.find(function (dialog) { return dialog.id === id; });
        },

        addDialog: addDialog,

        removeDialogs: removeDialogs,

        updateDialogs: function (dialogs) {
            removeDialogs();
            for (var i = 0; i < dialogs.length; i++) {
                addDialog(dialogs[i]);
            }
            dialogsStackNumber++;
        },

        getDialogByInterlocutorId: function (interlocutorId) {
            return dialogs.find(function (dialog) { return dialog.interlocutorId === interlocutorId; });
        }, 
        
        openDialog: function (dialog) {
            if (openedDialog === null || openedDialog.id !== dialog.id) {
                if (openedDialog !== null) {
                    openedDialog.Close();
                }
                if (!dialog.isPanelOpened) {
                    firstDialogMessagesUploading(dialog); // 
                }
                _guiManager.setDialog(dialog.title, dialog.status);
                dialog.Open();
                openedDialog = dialog;
            }
        },

        isDialogUploaded: function (interlocutorId) {
            var dialog = getDialogByInterlocutorId(interlocutorId);
            return dialog !== null && dialog !== undefined;
        },

        createDialogDiv: createDialogDiv,
        getDialogsStackNumber: function () { return dialogsStackNumber; }
    };
})();

var dialogGuiModule = (function () {

    var dialogsContainer,
        dialogTitleDiv,
        dialogStatusDiv,
        messagesPanelsContainer,
        uploadingInfo,
        messageBox,
        mesSendBut,
        dark;

    return {

        init: function () {
            dialogsContainer = document.getElementById("dialogs");
            dialogTitleDiv = document.getElementById("conversationTitle");
            dialogStatusDiv = document.getElementById("conversationStatus");
            messagesPanelsContainer = document.getElementById("panelsInner");
            uploadingInfo = document.getElementById("uploading");
            messageBox = document.getElementById("mesInput");
            mesSendBut = document.getElementById("mesSendBut");
            dark = document.getElementById("dark");
        },
        
        getDialogsContainer: function () { return dialogsContainer; },
        getDialogTitleDiv: function () { return dialogTitleDiv; },
        getDialogStatusDiv: function () { return dialogStatusDiv; },
        getMessagesPanelsContainer: function () { return messagesPanelsContainer; },
        getUploadingInfo: function () { return uploadingInfo; },
        getMessageBox: function () { return messageBox; },
        getMesSendBut: function () { return mesSendBut; },
        getDark: function () { return dark; }, 
        
        setDialog: function (title, status) {
            dialogTitleDiv.innerText = title;
            dialogStatusDiv.innerText = status;
        },

        showUploading: function () {
            dark.style.display = "block";
            uploadingInfo.style.display = "flex";
        },

        hideUploading: function () {
            dark.style.display = "none";
            uploadingInfo.style.display = "none";
        }
    };
})();