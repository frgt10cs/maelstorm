var accountGui = accountGuiModule;
var account = accountModule;
var loginForm = loginFormModule;
var regForm = registrationFormModule;
var dialog = dialogModule;
var dialogGui = dialogGuiModule;
var api = apiModule;

function init() {
    dialogGui.showUploading();
    api.getDialogs(dialog.getDialogsStackNumber, (dialogs) => {
        //signlRConnection.StartConnection();
        dialog.updateDialogs(dialogs);        
        dialogGui.hideUploading();
    });
}

function initModules(fingerprint) {
    api.init(fingerprint);
    accountGui.init(loginForm, regForm);
    account.init(api, accountGui);
    dialogGui.init();
    dialog.init(dialogGui);
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