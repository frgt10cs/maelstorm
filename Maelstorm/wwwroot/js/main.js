let api = apiModule;

/**
 * Method calling after login
 * to init data
 * 
 **/
async function init() {    
    dialogsGuiModule.showUploading();
    let dialogs = await api.getDialogs(dialogsModule.getDialogsOffset(), 20);
    signalRModule.startConnection();
    await dialogsModule.updateDialogs(await dialogModule.createDialogs(dialogs));
    dialogsGuiModule.hideUploading();
}

/**
 * Init modules which contains variable data 
 * and must be re-init every login
 * 
 **/
function initDynamicModules() {
    
}

/**
 * Init modules which don't depends
 * on user's account
 * @param {any} fingerprint
 */
function initStaticModules(fingerprint) {
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
        initStaticModules(fingerprint);        
        accountGuiModule.openLogin();
    });
}

main();