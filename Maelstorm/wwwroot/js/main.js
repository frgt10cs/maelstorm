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
    layoutGuiModule.init();
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
    if (window.screen.width < 992)
        initSmallDeviceMenu();
}

function initSmallDeviceMenu() {
    let dialogListContainer = document.getElementById("dialogListContainer");
    let openedDialogContainer = document.getElementById("openedDialogContainer");

    let openDialogListBtn = document.getElementById("openDialogListBtn");
    let openOpenedDialogBtn = document.getElementById("openOpenedDialogBtn");
    let openSettingsBtn = document.getElementById("openSettingsBtn");

    let currentBtn = openDialogListBtn;
    let currentContainer = dialogListContainer;

    function openContainer(btn, container) {
        currentBtn.className = currentBtn.className.replace("bg-dark-5", "bg-dark-2");
        currentContainer.className = currentContainer.className.replace("d-flex", "d-none");

        btn.className = btn.className.replace("bg-dark-2", "bg-dark-5");
        container.className = container.className.replace("d-none", "d-flex");
        currentBtn = btn;
        currentContainer = container;
    }

    openDialogListBtn.onclick = function () {
        openContainer(openDialogListBtn, dialogListContainer);        
    }

    openOpenedDialogBtn.onclick = function () {
        openContainer(openOpenedDialogBtn, openedDialogContainer);        
    }

    openSettingsBtn.onclick = function () {
        openContainer(openSettingsBtn, settingsGuiModule.getSettingsContainer());         
    }
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