let api = apiModule;

function init() {
    dialogsGuiModule.showUploading();
    api.getDialogs(dialogsModule.getDialogsOffset(), 20).then(data => {
        signalRModule.startConnection();
        dialogsModule.updateDialogs(dialogModule.createDialogs(data));
        dialogsGuiModule.hideUploading();
    }, error => {
        console.log(error);
    });
}

function initModules(fingerprint) {
    encodingModule.init();
    cryptoModule.init(encodingModule);
    api.init(fingerprint, cryptoModule, encodingModule);    
    accountGuiModule.init(loginFormModule, registrationFormModule);
    accountModule.init(api, accountGuiModule, init);
    dialogsGuiModule.init();
    dialogGuiModule.init(dateModule);
    dialogModule.init(api, dialogGuiModule, messageModule, dateModule, 20, dialogsGuiModule.toTheTop);
    dialogsModule.init(api, dialogsGuiModule, dialogModule);
    connectionGuiModule.init();
    signalRModule.init(api, fingerprint, dialogsModule, connectionGuiModule, accountGuiModule);
    sessionGuiModule.init();
    sessionModule.init(api, sessionGuiModule);
    userGuiModule.init();
    userModule.init(api, userGuiModule, dialogsModule);
    settingsGuiModule.init();
    settingsModule.init(settingsGuiModule);    
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