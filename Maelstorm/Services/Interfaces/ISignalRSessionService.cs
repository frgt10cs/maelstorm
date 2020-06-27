using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Dtos;
using Maelstorm.Models;

namespace Maelstorm.Services.Interfaces
{
    public interface ISignalRSessionService
    {
        public Task<string> GetConnectionId(string userId, string sessionId);
        public Task<SignalRSession> GetSignalRSession(string sessionId);
        public Task<IEnumerable<string>> GetConnectionIdsAsync(string userId);
        public Task CloseSessionAsync(string connectionId);
        public Task<bool> IsOnlineAsync(string userId);
        public Task<List<OnlineStatusDTO>> GetOnlineStatusesAsync(params int[] ids);
    }
}
