var cryptoModule = (function () {
    var _encoding;

    var validatePassphrase = function (passphrase, length) {
        var requiredLength = length / 8;
        if (passphrase.length < requiredLength)
            passphrase = passphrase + passphrase.substring(0, requiredLength - passphrase.length);
        else if (passphrase.length > requiredLength)
            passphrase = passphrase.substring(0, requiredLength);
        return passphrase;
    }

    return {
        init: function (encoding) {
            _encoding = encoding;
        },

        generateIV() {

        },

        genereateAesKeyByPassPhrase(passphrase, length) {
            passphrase = validatePassphrase(passphrase, length);
            var keyBytes = getBytes(passphrase);
            return window.crypto.subtle.importKey(
                "raw",
                keyBytes,
                "AES-CBC",
                true,
                ["encrypt", "decrypt"]
            );
        },

        encryptAes(aesKey, iv, plainText) {
            var dataBytes = _encoding.getBytes(plainText);
            return window.crypto.subtle.encrypt({
                name: "AES-CBC",                
                iv: iv,
            },
            aesKey, dataBytes);
        },

        decryptAes(aesKey, iv, encryptedDataBase64) {
            var encryptedBytes = _encoding.base64ToArray(encryptedDataBase64);
            return window.crypto.subtle.decrypt({
                name: "AES-CBC",
                iv: iv,
            },
            aesKey, encryptedBytes);
        }       
    }
})();