using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis.Extensions.Core.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class SignalRSessionService : ISignalRSessionService
    {
        private IRedisCacheClient cache;
        public SignalRSessionService(IRedisCacheClient cache)
        {
            this.cache = cache;
        }               

        public async Task<string> GetConnectionId(string userId, string sessionId)
        {
            return await cache.Db0.HashGetAsync<string>(userId, sessionId);
        }

        public async Task<SignalRSession> GetSignalRSession(string connectionId)
        {
            return await cache.Db1.GetAsync<SignalRSession>(connectionId);
        }

        public async Task<IEnumerable<string>> GetConnectionIdsAsync(string userId)
        {
            return await cache.Db0.HashValuesAsync<string>(userId);       
        }        
    }
}
