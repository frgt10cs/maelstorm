let dialogsModule = (function () {  
    let _api;
    let _guiManager;    
    let _dialog;
    let openedDialog;
    let dialogs;               

    let removeDialogs = function () {        
        while (_guiManager.getDialogsContainer().firstChild) {
            _guiManager.getDialogsContainer().firstChild.remove();
        }
        dialogs = [];
        dialogsStackNumber = 1;
        openedDialog = null;
    };             

    let addDialog = function (dialog) {        
        dialog.element.onclick = function () { openDialog(dialog); };
        _guiManager.getDialogsContainer().appendChild(dialog.element);
        _guiManager.getMessagesPanelsContainer().appendChild(dialog.messagesPanel);
        dialogs.push(dialog);        
    };

    let openDialog = function (dialog) {
        if (openedDialog === null || openedDialog.id !== dialog.id) {
            if (openedDialog !== null) {
                openedDialog.messagesPanel.style.display = "none";
            }
            _dialog.setDialogContext(dialog);            
            _dialog.openDialog();            
            openedDialog = dialog;
        }
    };

    let openOrCreateDialog = function (userInfo) {
        let dialog = getDialogByInterlocutorId(userInfo.id);
        if (dialog !== null && dialog !== undefined) {
            openDialog(dialog);
        } else {
            _api.getDialog(userInfo.id, (dialog) => {                
                dialog = _dialog.createDialog(dialog);
                addDialog(dialog);
                openDialog(dialog);
            });
        }
    };

    let getDialogByInterlocutorId = function (interlocutorId) {
        return dialogs.find(function (dialog) { return dialog.interlocutorId === interlocutorId; });
    };

    return {

        init: function (api, guiManager, dialogModule) {  
            _api = api;
            _guiManager = guiManager;  
            _dialog = dialogModule;
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
            for (let i = 0; i < dialogs.length; i++) {                
                addDialog(dialogs[i]);
            }
            dialogsStackNumber++;
        },

        getDialogByInterlocutorId: getDialogByInterlocutorId, 

        openDialog: openDialog,       
        openOrCreateDialog: openOrCreateDialog,

        isDialogUploaded: function (interlocutorId) {
            let dialog = getDialogByInterlocutorId(interlocutorId);
            return dialog !== null && dialog !== undefined;
        },

        getDialogsOffset: function () { return dialogs.length; }
    };
})();

let dialogsGuiModule = (function () {

    let dialogsContainer,
        messagesPanelsContainer,
        uploadingInfo,        
        dark;        

    return {
        init: function () {            
            dialogsContainer = document.getElementById("dialogs");            
            messagesPanelsContainer = document.getElementById("panelsInner");
            uploadingInfo = document.getElementById("uploading");            
            dark = document.getElementById("dark");
        },                
        
        getDialogsContainer: function () { return dialogsContainer; },        
        getMessagesPanelsContainer: function () { return messagesPanelsContainer; },
        getUploadingInfo: function () { return uploadingInfo; },        
        getDark: function () { return dark; },                 

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