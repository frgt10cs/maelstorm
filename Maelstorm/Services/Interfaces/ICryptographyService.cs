using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface ICryptographyService
    {
        byte[] AesEncryptBytes(byte[] bytes, string key, byte[] iv, int keySize = 128);
        string GetRandomString();
        string GeneratePasswordHash(string password, string salt);
        byte[] GenerateIV();
    }
}
