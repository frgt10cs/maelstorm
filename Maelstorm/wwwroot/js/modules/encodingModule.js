let encoding = (function () {
    return {
        getBytes: function (string) {
            string = btoa(unescape(encodeURIComponent(string))),
                charList = string.split(''),
                uintArray = [];
            for (let i = 0; i < charList.length; i++) {
                uintArray.push(charList[i].charCodeAt(0));
            }
            return new Uint8Array(uintArray);
        },

        getString: function (uintArray) {
            let encodedString = String.fromCharCode.apply(null, uintArray),
                decodedString = decodeURIComponent(escape(atob(encodedString)));
            return decodedString;
        },

        arrayToBase64: function (buffer) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },

        base64ToArray: function(base64) {
            let binaryString = window.atob(base64);
            let len = binaryString.length;
            let bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
        return new Uint8Array(bytes.buffer);
        }    
    }
})();