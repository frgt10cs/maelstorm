let settingsModule = (function () {
    return {
        init: function (guiManager) {
            settingsGuiModule.init();            
        }
    };
})();

let settingsGuiModule = (function () {
    let settingsContainer;
    let settingPanelSlider;
    let settingsInnerContainer;
    let isPanelOpened = false;
    let hideWidth;
    let openSettingsContainerBtn;
    let closeSettingsContainerBtn;

    let initSettingsInnerContainer = function () {
        for (let i = 0; i < settingsInnerContainer.children.length; i++) {            
            let inner = settingsInnerContainer.children[i].children[1];
            settingsInnerContainer.children[i].children[0].onclick = function () {
                $(inner).slideToggle("slow");
            };
        }
    };

    let openSettingsContainer = function () {
        layoutGuiModule.showDark();
        $(settingsContainer).animate({ right: "0px" }, 500);        
    };

    let closeSettingsContainer = function () {
        layoutGuiModule.hideDark();
        $(settingsContainer).animate({ right: hideWidth + "px" }, 500);        
    };

    return {
        init: function () {                       
            settingsContainer = document.getElementById("settingsContainer");
            settingsInnerContainer = document.getElementById("settingsInnerContainer");            
            openSettingsContainerBtn = document.getElementById("settingsOpenBtn");
            openSettingsContainerBtn.onclick = openSettingsContainer;            
            closeSettingsContainerBtn = document.getElementById("settingsCloseBtn");
            closeSettingsContainerBtn.onclick = closeSettingsContainer;
            hideWidth = -settingsContainer.offsetWidth /*+ settingsPanelOpenBtn.offsetWidth*/;
            initSettingsInnerContainer();            
        },

        openSettingsContainer: openSettingsContainer,
        closeSettingsContainer: closeSettingsContainer,     

        getSettingsPanelOpenBtn: function () { return openSettingsContainerBtn; },
        getSettingsPanelCloseBtn: function () { return closeSettingsContainerBtn; },

        getSettingsContainer: function () { return settingsContainer; }
    }
})();