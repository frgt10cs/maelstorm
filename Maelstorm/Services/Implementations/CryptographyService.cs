using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class CryptographyService:ICryptographyService
    {
        private string MainSalt;

        public CryptographyService(IConfiguration config)
        {            
            MainSalt = config["MainSalt"];
        }

        public byte[] AesEncryptBytes(byte[] bytes, string key, byte[] iv, int keySize = 128)
        {
            int keyRequiredLength = keySize / 8;
            if (key.Length > keyRequiredLength)
                key = key.Substring(0, keyRequiredLength);
            if (key.Length < keyRequiredLength)
                key = key + key.Substring(0, keyRequiredLength - key.Length);
            byte[] result;
            using (Aes aes = Aes.Create())
            {
                aes.KeySize = keySize;
                aes.BlockSize = 128;
                aes.Key = Encoding.UTF8.GetBytes(key);

                using (var encryptor = aes.CreateEncryptor(aes.Key, iv))
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                        {
                            cryptoStream.Write(bytes, 0, bytes.Length);
                            cryptoStream.FlushFinalBlock();
                            result = memoryStream.ToArray();
                        }
                    }
                }
            }
            return result;
        }           

        public string GetRandomString()
        {
            byte[] randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            return Convert.ToBase64String(randomNumber);
        }

        public string GeneratePasswordHash(string password, string salt)
        {
            return Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: Encoding.UTF8.GetBytes(salt + MainSalt),
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 1000,
                numBytesRequested: 256 / 8
                ));
        }
    }
}
