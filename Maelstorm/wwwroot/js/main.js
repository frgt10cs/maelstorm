let api = apiModule;

async function init() {
    dialogsGuiModule.showUploading();
    let dialogs = await api.getDialogs(dialogsModule.getDialogsOffset(), 20);
    signalRModule.startConnection();
    await dialogsModule.updateDialogs(await dialogModule.createDialogs(dialogs));
    dialogsGuiModule.hideUploading();
}

function initModules(fingerprint) {
    encodingModule.init();
    cryptoModule.init();
    api.init(fingerprint);        
    accountModule.init(init);        
    dialogModule.init(20);
    dialogsModule.init();    
    signalRModule.init(fingerprint);    
    sessionModule.init();    
    userModule.init();    
    settingsModule.init();    
}

function main() {
    Fingerprint2.get(function(components) {
        let values = components.map(function (component) { return component.value; });
        let fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
        initModules(fingerprint);        
        
        if (api.areTokensValid()) {
            init();
        } else {
            accountGuiModule.openLogin();
        }
    });
}

main();