using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Models;

namespace Maelstorm.Services.Interfaces
{
    public interface ISignalRSessionService
    {
        public Task<string> GetConnectionId(string userId, string sessionId);
        public Task<SignalRSession> GetSignalRSession(string sessionId);
        public Task<IEnumerable<string>> GetConnectionIdsAsync(string userId);
    }
}
