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
        $(settingsPanel).animate({ left: "0px" }, 500);        
    };

    let closeSettingsPanel = function () {
        $(settingsPanel).animate({ left: hideWidth + "px" }, 500);        
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

        changeSettingsOpenState: function () {
            if (isPanelOpened) {
                $(settingsPanel).animate({ left: hideWidth + "px" }, 500);
                settingPanelSlider.style.backgroundImage = "url(/images/openPanel.png)";
            }
            else {
                $(settingsPanel).animate({ left: "0px" }, 500);
                settingPanelSlider.style.backgroundImage = "url(/images/closePanel.png)";
            }
            isPanelOpened = !isPanelOpened;
        },

        getSettingsPanelOpenBtn: function () { return settingsPanelOpenBtn; },
        getSettingsPanelCloseBtn: function () { return settingsPanelCloseBtn; }
    }
})();