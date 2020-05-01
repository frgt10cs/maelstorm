let dialogsModule = (function () {              
    let openedDialog;
    let dialogs;               

    let removeDialogs = function () {        
        while (dialogsGuiModule.getDialogsContainer().firstChild) {
            dialogsGuiModule.getDialogsContainer().firstChild.remove();
        }
        dialogs = [];
        dialogsStackNumber = 1;
        openedDialog = null;
    };             

    let addDialog = function (dialog) {        
        dialog.element.onclick = function () { openDialog(dialog); };
        dialogsGuiModule.getDialogsContainer().appendChild(dialog.element);
        dialogsGuiModule.getMessagesPanelsContainer().appendChild(dialog.messagesPanel);
        dialogs.push(dialog);        
    };

    let openDialog = function (dialog) {
        if (openedDialog === null || openedDialog.id !== dialog.id) {
            if (openedDialog !== null) {
                openedDialog.messagesPanel.style.display = "none";
            }
            dialogModule.setDialogContext(dialog);            
            dialogModule.openDialog();            
            openedDialog = dialog;
        }
    };

    let openOrCreateDialog = async function (userInfo) {
        let dialog = getDialogByInterlocutorId(userInfo.id);
        if (dialog !== null && dialog !== undefined) {
            openDialog(dialog);
        } else {
            dialog = await api.getDialog(userInfo.id);
            dialog = dialogModule.createDialog(dialog);
            addDialog(dialog);
            openDialog(dialog);
        }
    };

    let getDialogByInterlocutorId = function (interlocutorId) {
        return dialogs.find(function (dialog) { return dialog.interlocutorId === interlocutorId; });
    };

    return {

        init: function () {
            dialogsGuiModule.init();
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