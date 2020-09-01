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
                var publicKeyXML = File.ReadAllBytes(Path.Combine(Directory.GetCurrentDirectory(), Configuration["PublicKeyPath"]));
                publicRSA.ImportRSAPublicKey(publicKeyXML, out _);
                PublicKey = new RsaSecurityKey(publicRSA);                
            }
            using (RSA privateRSA = RSA.Create())
            {
                var privateKeyXML = File.ReadAllBytes(Path.Combine(Directory.GetCurrentDirectory(), Configuration["PrivateKeyPath"]));
                privateRSA.ImportRSAPrivateKey(privateKeyXML, out _);
                PrivateKey = new RsaSecurityKey(privateRSA);
            }
        }
    }
}
