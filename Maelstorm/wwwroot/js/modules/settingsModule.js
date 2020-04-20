let settingsModule = (function () {
    let _guiManager;
    return {
        init: function (guiManager) {
            _guiManager = guiManager;
            _guiManager.getSettingsPanelSlider().onclick = function () { _guiManager.changeSettingsOpenState(); };
        }
    };
})();

let settingsGuiModule = (function () {
    let settingsPanel;
    let settingPanelSlider;
    let settingsContainers;
    let isPanelOpened = false;
    let hideWidth;

    let initSettingsPanel = function () {
        for (let i = 0; i < settingsContainers.length; i++) {
            let inner = settingsContainers[i].children[1];
            settingsContainers[i].children[0].onclick = function () {
                $(inner).slideToggle("slow");
            };
        }
    };

    return {
        init: function () {
            settingsPanel = document.getElementById("settingsPanel");
            settingPanelSlider = document.getElementById("settingsPanelSlider");
            settingsContainers = document.getElementsByClassName("settingsContainer");
            hideWidth = -settingsPanel.offsetWidth + settingPanelSlider.offsetWidth
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

        getSettingsPanelSlider: function () { return settingPanelSlider; }
    }
})();