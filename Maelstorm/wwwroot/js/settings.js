var settingsPanel = document.getElementById("settingsPanel");
var settingPanelSlider = document.getElementById("settingsPanelSlider");
var settingsContainers = document.getElementsByClassName("settingsContainer");
var isPanelOpened = false;
var hideWidth = -settingsPanel.offsetWidth + settingPanelSlider.offsetWidth;

settingPanelSlider.onclick = function () {
    if (isPanelOpened) {
        $(settingsPanel).animate({ left: hideWidth + "px" }, 500);
        this.style.backgroundImage = "url(/images/openPanel.png)";
    }
    else {
        $(settingsPanel).animate({ left: "0px" }, 500);
        this.style.backgroundImage = "url(/images/closePanel.png)";
    }
    isPanelOpened = !isPanelOpened;
};

for (var i = 0; i < settingsContainers.length; i++) {
    var inner = settingsContainers[i].children[1];
    settingsContainers[i].children[0].onclick = function () {
        $(inner).slideToggle("slow");
    };
}