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

    let getKeyMaterial = function (passPhrase) {
        let enc = new TextEncoder();
        return window.crypto.subtle.importKey(
            "raw",
            enc.encode(passPhrase),
            "PBKDF2",
            false,
            ["deriveBits","deriveKey"]
        )
    };

    let genereateAesKeyByPassPhrase = async function (passPhrase, salt, keyLength) {
        let keyMaterial = await getKeyMaterial(passPhrase);
        return window.crypto.subtle.deriveKey(
            {
                "name": "PBKDF2",
                salt: salt,
                "iterations": 10000,
                "hash": "SHA-1",
            },
            keyMaterial,
            { "name": "AES-CBC", "length": keyLength },
            true,
            ["encrypt", "decrypt"]
        );
    }

    return {
        init: function (encoding) {
            _encoding = encoding;
        },

        generateIV: function() {

        },

        genereateAesKeyByPassPhrase: genereateAesKeyByPassPhrase,

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
        },        
    }
})();