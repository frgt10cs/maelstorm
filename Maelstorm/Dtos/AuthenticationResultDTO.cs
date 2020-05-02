using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class AuthenticationResultDTO
    {
        public string IVBase64 { get; set; }
        public string KeySaltBase64 { get; set; }
        public string PublicKey { get; set; }
        public string EncryptedPrivateKey { get; set; }
        public TokensDTO Tokens { get; set; }
    }
}
