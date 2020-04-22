let encodingModule = (function () {
    return {
        init: function () {

        },

        getBytes: function (string) {
            return new TextEncoder("utf-8").encode(string);            
        },

        getString: function (uintArray) {
            return new TextDecoder("utf-8").decode(uintArray);
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