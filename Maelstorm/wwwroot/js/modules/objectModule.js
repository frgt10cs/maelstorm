let objectModule = (function () {

    let isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    let iterationCopy = function (obj) {
        let target = {};
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (isObject(obj[prop])) {
                    target[prop] = iterationCopy(obj[prop]);
                } else {
                    target[prop] = obj[prop];
                }
            }
        }
        return target;
    };

    return {

        isObject: isObject,

        iterationCopy: iterationCopy
    }
})()