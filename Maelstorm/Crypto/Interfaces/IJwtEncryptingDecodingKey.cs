using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Crypto.Interfaces
{
    /// <summary>
    /// Private
    /// </summary>
    public interface IJwtEncryptingDecodingKey
    {
        SecurityKey GetKey();
    }
}
