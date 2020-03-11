var dialogsModule = (function () {
    var _guiManager;    
    var openedDialog;
    var dialogs;
    var dialogsStackNumber;               

    var removeDialogs = function () {
        while (_guiManager.getDialogsContainer().firstChild) {
            _guiManager.getDialogsContainer().firstChild.remove();
        }
        dialogs = [];
        dialogsStackNumber = 1;
        openedDialog = null;
    };             

    var addDialog = function (dialog) {        
        _guiManager.getDialogsContainer().appendChild(dialog.element);
        _guiManager.getMessagesPanelsContainer().appendChild(dialog.messagesPanel);
        dialogs.push(dialog);
    };

    return {

        init: function (guiManager) {
            _guiManager = guiManager;            
            openedDialog = null;
            dialogs = [];
            dialogsStackNumber = 1;            
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
                    openedDialog.messagesPanel.style.display = "none";
                }
                if (!dialog.isPanelOpened) {
                    firstDialogMessagesUploading(dialog); // 
                }
                _guiManager.setDialog(dialog.title, dialog.status);
                dialog.isPanelOpened = true;
                dialog.messagesPanel.style.display = "block";
                openedDialog = dialog;
            }
        },                

        isDialogUploaded: function (interlocutorId) {
            var dialog = getDialogByInterlocutorId(interlocutorId);
            return dialog !== null && dialog !== undefined;
        },
        
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
        },

        toTheTop: function (dialog) {
            dialogsContainer.insertBefore(dialog.element, dialogsContainer.firstChild);
        }
    };
})();