using Maelstorm.Services.Interfaces;
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
        public byte[] AesEncryptBytes(byte[] bytes, string key, byte[] iv)
        {
            byte[] result;
            using (Aes aes = Aes.Create())
            {
                aes.KeySize = 128;
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
    }
}
