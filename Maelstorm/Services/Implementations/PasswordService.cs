using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Cryptography;
using System.Text;

namespace Maelstorm.Services.Implementations
{
    public class PasswordService:IPasswordService
    {
        private readonly Random rnd = new Random();                
        private string MainSalt;

        private IConfiguration config;
        public PasswordService(IConfiguration config)
        {
            this.config = config;
            MainSalt = config["MainSalt"];
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

        public string GenerateHash(string password, string salt)
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
