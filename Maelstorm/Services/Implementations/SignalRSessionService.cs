using Maelstorm.Dtos;
using Maelstorm.Hubs;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
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
        private IHubContext<MessageHub> messHub;
        public SignalRSessionService(IRedisCacheClient cache, IHubContext<MessageHub> messHub)
        {
            this.cache = cache;
            this.messHub = messHub;
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

        public async Task CloseSessionAsync(string connectionId)
        {
            await cache.Db1.RemoveAsync(connectionId);
            await messHub.Clients.Client(connectionId).SendAsync("OnSessionClosed");
        }

        public async Task<bool> IsOnlineAsync(string userId)
        {
            return await cache.Db0.ExistsAsync(userId.ToString());
        }

        public async Task<List<OnlineStatusDTO>> GetOnlineStatusesAsync(params int[] ids)
        {
            var statuses = new List<OnlineStatusDTO>();
            foreach (int id in ids)
            {
                statuses.Add(new OnlineStatusDTO()
                {
                    UserId = id,
                    IsOnline = await IsOnlineAsync(id.ToString())
                });
            }
            return statuses;
        }
    }
}
