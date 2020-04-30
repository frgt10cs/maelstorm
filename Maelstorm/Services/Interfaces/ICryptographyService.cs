using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface ICryptographyService
    {
        byte[] AesEncryptBytes(byte[] bytes, byte[] key, byte[] iv, int keySize = 128);
        byte[] GenerateSalt(int size = 32);
        string GetRandomBase64String(int byteArraySize = 32);
        byte[] Pbkdf2(string password, byte[] salt, int numBytes = 32);
        byte[] GenerateIV();
        byte[] PBKDF2_SHA256(string password, byte[] salt, int iterations, int hashByteSize);
    }
}
