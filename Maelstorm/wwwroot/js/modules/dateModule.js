var dateModule = (function () {    
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sem", "Okt", "Nov", "Dec"];

    return {
        getDate: function (date) {
            var currentDate = new Date();
            var dateString = "";
            if (date.toDateString() !== currentDate.toDateString()) {
                if (date === currentDate.getDate() - 1) {
                    dateString = "Tomorrow";
                } else {
                    dateString = months[date.getMonth()] + " " + date.getDate();
                    if (date.getFullYear() !== currentDate.getFullYear()) {
                        dateString += " " + date.getFullYear();
                    }
                }
            } else {
                var minutes = date.getMinutes().toString();
                dateString = date.getHours() + ":" + (minutes.length === 2 ? minutes : "0" + minutes);
            }
            return dateString;
        }
    };
})();