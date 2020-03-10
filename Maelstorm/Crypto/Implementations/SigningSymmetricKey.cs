using Maelstorm.Crypto.Interfaces;
using Maelstorm.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Maelstorm.Crypto.Implementations
{
    public class SigningSymmetricKey : ISymmetricSigningKeys
    {
        private readonly SymmetricSecurityKey secretKey;

        public string SigningAlgorithm { get; } = SecurityAlgorithms.HmacSha256;        

        public SigningSymmetricKey(string key)
        {            
            secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));            
        }
        
        public SecurityKey GetKey()
        {
            return secretKey;
        }
    }
}
