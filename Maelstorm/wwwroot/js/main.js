let accountGui = accountGuiModule;
let account = accountModule;
let loginForm = loginFormModule;
let regForm = registrationFormModule;
let dialogs = dialogsModule;
let dialog = dialogModule;
let message = messageModule;
let dialogsGui = dialogsGuiModule;
let dialogGui = dialogGuiModule;
let date = dateModule;
let api = apiModule;
let signalRConnection = signalRModule;
let connectionGui = connectionGuiModule;
let user = userModule;
let userGui = userGuiModule;
let session = sessionModule;
let sessionGui = sessionGuiModule;
let settings = settingsModule;
let settingsGui = settingsGuiModule;
let crypto = cryptoModule;

function init() {
    dialogsGui.showUploading();
    api.getDialogs(dialogs.getDialogsOffset(), 20).then(data => {
        signalRConnection.startConnection();
        dialogs.updateDialogs(dialog.createDialogs(data));
        dialogsGui.hideUploading();
    }, error => {
        console.log(error);
    });
}

function initModules(fingerprint) {
    api.init(fingerprint);
    accountGui.init(loginForm, regForm);
    account.init(api, accountGui, init);
    dialogsGui.init();
    dialogGui.init(date);
    dialog.init(api, dialogGui, message, date, 20, dialogsGui.toTheTop);
    dialogs.init(api, dialogsGui, dialog);
    connectionGui.init();
    signalRConnection.init(api, fingerprint, dialogs, connectionGui, accountGui);
    sessionGui.init();
    session.init(api, sessionGui);
    userGui.init();
    user.init(api, userGui, dialogs);
    settingsGui.init();
    settings.init(settingsGui);    
}

function main() {
    Fingerprint2.get(function(components) {
        let values = components.map(function (component) { return component.value; });
        let fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
        initModules(fingerprint);        
        
        if (api.areTokensValid()) {
            init();
        } else {
            accountGui.openLogin();
        }
    });
}

main();