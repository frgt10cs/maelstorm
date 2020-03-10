using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IPasswordService
    {
        string GetRandomString();
        string GenerateHash(string password, string salt);
    }
}
