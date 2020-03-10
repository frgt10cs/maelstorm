using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Maelstorm.Crypto.Interfaces;
using Maelstorm.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Maelstorm.Crypto;

namespace Maelstorm.Crypto.Implementations
{
    public class EncryptingAsymmetricKey : IAsymmetricEncryptingKeys
    {
        IConfiguration Configuration;
        private SecurityKey PublicKey;
        private SecurityKey PrivateKey;

        public EncryptingAsymmetricKey(IConfiguration config)
        {
            Configuration = config;
            InitKeys();
        }

        public string SigningAlgorithm => JwtConstants.DirectKeyUseAlg;

        public string EncryptingAlgorithm => SecurityAlgorithms.RsaSha256;

        SecurityKey IJwtEncryptingDecodingKey.GetKey()
        {
            return PrivateKey;
        }

        SecurityKey IJwtEncryptingEncodingKey.GetKey()
        {
            return PublicKey;
        }
               
        public void InitKeys()
        {            
            using (RSA publicRSA = RSA.Create())
            {                
                var publicKeyXML = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), Configuration["PublicKeyPath"]));
                publicRSA.FromXml(publicKeyXML);
                PublicKey = new RsaSecurityKey(publicRSA);                
            }
            using (RSA privateRSA = RSA.Create())
            {
                var privateKeyXML = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), Configuration["PrivateKeyPath"]));
                privateRSA.FromXml(privateKeyXML);
                PrivateKey = new RsaSecurityKey(privateRSA);
            }
        }
    }
}
