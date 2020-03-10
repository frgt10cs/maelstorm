using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Models;

namespace Maelstorm.Services.Interfaces
{
    public interface ISignalRSessionService
    {        
        Task<IReadOnlyList<string>> GetConnectionIdsAsync(int userId);
        Task<IReadOnlyList<string>> GetConnectionIdsAsync(int userId, Func<SignalRSession, bool> predicate);
    }
}
