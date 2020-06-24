let settingsModule = (function () {
    return {
        init: function (guiManager) {
            settingsGuiModule.init();            
        }
    };
})();

let settingsGuiModule = (function () {
    let settingsPanel;
    let settingPanelSlider;
    let settingsContainers;
    let isPanelOpened = false;
    let hideWidth;
    let settingsPanelOpenBtn;
    let settingsPanelCloseBtn;

    let initSettingsPanel = function () {
        for (let i = 0; i < settingsContainers.length; i++) {
            let inner = settingsContainers[i].children[1];
            settingsContainers[i].children[0].onclick = function () {
                $(inner).slideToggle("slow");
            };
        }
    };

    let openSettingsPanel = function () {
        layoutGuiModule.showDark();
        $(settingsPanel).animate({ right: "0px" }, 500);        
    };

    let closeSettingsPanel = function () {
        layoutGuiModule.hideDark();
        $(settingsPanel).animate({ right: hideWidth + "px" }, 500);        
    };

    return {
        init: function () {
            settingsPanel = document.getElementById("settingsPanel");            
            settingsContainers = document.getElementsByClassName("settingsContainer");
            settingsPanelOpenBtn = document.getElementById("settingsOpenBtn");
            settingsPanelOpenBtn.onclick = openSettingsPanel;            
            settingsPanelCloseBtn = document.getElementById("settingsCloseBtn");
            settingsPanelCloseBtn.onclick = closeSettingsPanel;
            hideWidth = -settingsPanel.offsetWidth /*+ settingsPanelOpenBtn.offsetWidth*/;
            initSettingsPanel();
        },

        openSettingsPanel: openSettingsPanel,
        closeSettingsPanel: closeSettingsPanel,       

        getSettingsPanelOpenBtn: function () { return settingsPanelOpenBtn; },
        getSettingsPanelCloseBtn: function () { return settingsPanelCloseBtn; }
    }
})();