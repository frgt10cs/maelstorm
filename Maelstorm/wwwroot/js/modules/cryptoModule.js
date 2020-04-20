let cryptoModule = (function () {
    let _encoding;

    let validatePassphrase = function (passphrase, length) {
        let requiredLength = length / 8;
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

        generateIV: function() {

        },

        genereateAesKeyByPassPhrase: function(passphrase, length) {
            passphrase = validatePassphrase(passphrase, length);
            let keyBytes = getBytes(passphrase);
            return window.crypto.subtle.importKey(
                "raw",
                keyBytes,
                "AES-CBC",
                true,
                ["encrypt", "decrypt"]
            );
        },

        encryptAes: function(aesKey, iv, plainText) {
            let dataBytes = _encoding.getBytes(plainText);
            return window.crypto.subtle.encrypt({
                name: "AES-CBC",                
                iv: iv,
            },
            aesKey, dataBytes);
        },

        decryptAes: function(aesKey, iv, encryptedDataBase64) {
            let encryptedBytes = _encoding.base64ToArray(encryptedDataBase64);
            return window.crypto.subtle.decrypt({
                name: "AES-CBC",
                iv: iv,
            },
            aesKey, encryptedBytes);
        }       
    }
})();