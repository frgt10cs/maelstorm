using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class SignalRSessionService : ISignalRSessionService
    {
        private IDistributedCache cache;
        public SignalRSessionService(IDistributedCache cache)
        {
            this.cache = cache;
        }       

        public async Task<IReadOnlyList<string>> GetConnectionIdsAsync(int userId)
        {
            IReadOnlyList<string> connectionIds = (await cache.GetListAsync<SignalRSession>(userId.ToString()))?.Select(s => s.ConnectionId).ToList();
            return connectionIds;
        }

        public  async Task<IReadOnlyList<string>> GetConnectionIdsAsync(int userId, Func<SignalRSession, bool> predicate)
        {
            IReadOnlyList<string> connectionIds = (await cache.GetListAsync<SignalRSession>(userId.ToString()))?.Where(s => predicate(s)).Select(s => s.ConnectionId).ToList();
            return connectionIds;
        }
    }
}
