var encoding = (function () {
    return {
        getBytes: function (string) {
            string = btoa(unescape(encodeURIComponent(string))),
                charList = string.split(''),
                uintArray = [];
            for (var i = 0; i < charList.length; i++) {
                uintArray.push(charList[i].charCodeAt(0));
            }
            return new Uint8Array(uintArray);
        },

        getString: function (uintArray) {
            var encodedString = String.fromCharCode.apply(null, uintArray),
                decodedString = decodeURIComponent(escape(atob(encodedString)));
            return decodedString;
        },

        arrayToBase64: function (buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },

        base64ToArray: function(base64) {
            var binaryString = window.atob(base64);
            var len = binaryString.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
        return new Uint8Array(bytes.buffer);
        }    
    }
})();