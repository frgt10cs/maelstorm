var settingsModule = (function () {
    var _guiManager;
    return {
        init: function (guiManager) {
            _guiManager = guiManager;
            _guiManager.getSettingsPanelSlider().onclick = function () { _guiManager.changeSettingsOpenState(); };
        }
    };
})();

var settingsGuiModule = (function () {
    var settingsPanel;
    var settingPanelSlider;
    var settingsContainers;
    var isPanelOpened = false;
    var hideWidth;

    var initSettingsPanel = function () {
        for (var i = 0; i < settingsContainers.length; i++) {
            var inner = settingsContainers[i].children[1];
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