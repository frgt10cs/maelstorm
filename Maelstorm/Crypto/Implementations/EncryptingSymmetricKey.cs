using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Maelstorm.Crypto.Interfaces;
using Maelstorm.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace Maelstorm.Crypto.Implementations
{
    public class EncryptingSymmetricKey : IEncryptingKeys
    {
        private readonly SymmetricSecurityKey secretKey;        

        public string SigningAlgorithm { get; } = JwtConstants.DirectKeyUseAlg;

        public string EncryptingAlgorithm { get; } = SecurityAlgorithms.Aes256CbcHmacSha512;

        public EncryptingSymmetricKey(string key)
        {            
            secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));           
        }

        public SecurityKey GetKey() => secretKey;
    }
}
