let cryptoModule = (function () {      

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
                "hash": "SHA-256",
            },
            keyMaterial,
            { "name": "AES-CBC", "length": keyLength },
            true,
            ["encrypt", "decrypt"]
        );
    }

    return {
        init: function () {
            
        },

        generateIV: function (size = 16) {
            let array = new Uint32Array(size);
            window.crypto.getRandomValues(array);
            return array;
        },

        genereateAesKeyByPassPhrase: genereateAesKeyByPassPhrase,

        encryptAes: function(aesKey, iv, plainText) {
            let dataBytes = encodingModule.getBytes(plainText);
            return window.crypto.subtle.encrypt({
                name: "AES-CBC",                
                iv: iv,
            },
            aesKey, dataBytes);
        },

        decryptAes: function(aesKey, iv, encryptedDataBase64) {
            let encryptedBytes = encodingModule.base64ToArray(encryptedDataBase64);            
            return window.crypto.subtle.decrypt({
                name: "AES-CBC",
                iv: iv,
            },
            aesKey, encryptedBytes);            
        },        

        decryptRsa: function (encryptedDataBase64, privateKey) {

        }
    }
})();