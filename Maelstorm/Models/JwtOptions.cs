using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Models
{
    public class JwtOptions
    {
        public string Issuer { get; set; }
        public string Audience { get; set; }   
        public int ExpiryMinutes { get; set; } 
        public string SigningKey { get; set; }
        public string EncryptingKey { get; set; }
    }
}
