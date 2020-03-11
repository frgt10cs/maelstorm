var accountGui = accountGuiModule;
var account = accountModule;
var loginForm = loginFormModule;
var regForm = registrationFormModule;
var dialogs = dialogsModule;
var dialog = dialogModule;
var dialogGui = dialogGuiModule;
var date = dateModule;
var api = apiModule;

function init() {
    dialogGui.showUploading();
    api.getDialogs(dialogs.getDialogsStackNumber(), (data) => {
        //signlRConnection.StartConnection();
        dialogs.updateDialogs(dialog.createDialogs(data));        
        dialogGui.hideUploading();
    });
}

function initModules(fingerprint) {
    api.init(fingerprint);
    accountGui.init(loginForm, regForm);
    account.init(api, accountGui);
    dialogGui.init();
    dialog.init(api, date, 50, dialogGui.toTheTop);
    dialogs.init(dialogGui);
    //signalRConnection = new SignalRConnection(api, fingerprint, "/messageHub", dialogManager, connectionGui); 
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