let layoutGuiModule = (function () {
    let dark;
    let navOptions;

    return {
        init: function () {
            dark = document.getElementById("dark");
            navOptions = document.getElementById("nav-options");
        },

        showNavOptions: function () {
            navOptions.style.setProperty("display", "flex", "important");
        },

        hideNavOptions: function () {
            navOptions.style.setProperty("display", "none", "important");
        },

        hideDark: function () {
            dark.style.display = "none";
        },

        showDark: function () {
            dark.style.display = "block";
        }
    }
})();