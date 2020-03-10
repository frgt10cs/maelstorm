using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Crypto.Interfaces
{
    /// <summary>
    /// Public 
    /// </summary>
    public interface IJwtSigningDecodingKey
    {
        SecurityKey GetKey();
    }
}
