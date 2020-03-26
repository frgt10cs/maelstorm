var accountGui = accountGuiModule;
var account = accountModule;
var loginForm = loginFormModule;
var regForm = registrationFormModule;
var dialogs = dialogsModule;
var dialog = dialogModule;
var message = messageModule;
var dialogsGui = dialogsGuiModule;
var dialogGui = dialogGuiModule;
var date = dateModule;
var api = apiModule;
var signalRConnection = signalRModule;
var connectionGui = connectionGuiModule;
var user = userModule;
var userGui = userGuiModule;
var session = sessionModule;
var sessionGui = sessionGuiModule;

function init() {
    dialogsGui.showUploading();
    api.getDialogs(dialogs.getDialogsStackNumber(), (data) => {
        signalRConnection.startConnection();
        dialogs.updateDialogs(dialog.createDialogs(data));        
        dialogsGui.hideUploading();
    });
}

function initModules(fingerprint) {
    api.init(fingerprint);
    accountGui.init(loginForm, regForm);
    account.init(api, accountGui, init);
    dialogsGui.init();
    dialogGui.init(date);
    dialog.init(api, dialogGui, message, date, 20, dialogsGui.toTheTop);
    dialogs.init(dialogsGui, dialog);
    connectionGui.init();
    signalRConnection.init(api, fingerprint, dialogs, connectionGui);
    sessionGui.init();
    session.init(api, sessionGui);
    userGui.init();
    user.init(api, userGui);
}

function main() {
    Fingerprint2.get(function(components) {
        var values = components.map(function (component) { return component.value; });
        var fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
        initModules(fingerprint);        
        
        if (api.areTokensValid()) {
            init();
        } else {
            accountGui.openLogin();
        }
    });
}

main();