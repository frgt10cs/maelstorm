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

        public byte[] AesEncryptBytes(byte[] bytes, byte[] key, byte[] iv, int keySize = 128)
        {            
            byte[] result;
            using (Aes aes = Aes.Create())
            {
                aes.KeySize = keySize;
                aes.BlockSize = 128;
                aes.Key = key;

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

        public byte[] GenerateSalt(int size = 32)
        {
            var salt = new byte[size];
            using (var random = new RNGCryptoServiceProvider())
            {
                random.GetNonZeroBytes(salt);
            }
            return salt;
        }

        public string GetRandomBase64String(int byteArraySize = 32)
        {           
            return Convert.ToBase64String(GenerateSalt(byteArraySize));
        }

        public byte[] Pbkdf2(string password, byte[] salt, int numBytes = 32)
        {
            return KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: numBytes
                );
        }

        public byte[] GenerateIV()
        {
            using var aes = Aes.Create();
            aes.GenerateIV();
            return aes.IV;
        }
    }
}
