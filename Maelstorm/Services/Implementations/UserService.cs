using Maelstorm.Database;
using Maelstorm.Entities;
using Maelstorm.Hubs;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.Dtos;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StackExchange.Redis.Extensions.Core.Abstractions;

namespace Maelstorm.Services.Implementations
{
    public class UserService : IUserService
    {
        private MaelstormContext context;
        private IRedisCacheClient cache;
        private IOptions<JwtOptions> jwtOptions;
        private IHubContext<MessageHub> messHub;
        public UserService(MaelstormContext context, IRedisCacheClient cache,
            IOptions<JwtOptions> jwtOptions, IHubContext<MessageHub> messHub)
        {
            this.context = context;
            this.cache = cache;
            this.jwtOptions = jwtOptions;
            this.messHub = messHub;
        }

        public async Task CloseSessionAsync(int userId, string sessionId, bool banDevice = false)
        {
            Session session = await context.Sessions.FirstOrDefaultAsync(s => s.SessionId == sessionId && s.UserId == userId);
            if (session != null)
            {
                string userIdString = userId.ToString();
                var connectionId = await cache.Db0.HashGetAsync<string>(userIdString, sessionId);
                if (!string.IsNullOrEmpty(connectionId))
                {
                    await cache.Db0.HashDeleteAsync(userIdString, sessionId);
                    await cache.Db1.RemoveAsync(connectionId);
                    await messHub.Clients.Client(connectionId).SendAsync("OnSessionClosed");                    
                }
                await cache.Db2.AddAsync(sessionId, "", TimeSpan.FromMinutes(5));                
                
                if (banDevice)
                {
                    context.BannedDevices.Add(new BannedDevice() { UserId = userId, Fingerprint = session.FingerPrint });
                }
                context.Sessions.Remove(session);
                await context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsOnlineAsync(int userId)
        {
            return await cache.Db0.ExistsAsync(userId.ToString());
        }

        public async Task<List<OnlineStatusDTO>> GetOnlineStatusesAsync(params int[] ids)
        {
            var statuses = new List<OnlineStatusDTO>();
            foreach(int id in ids)
            {
                statuses.Add(new OnlineStatusDTO()
                {
                    UserId = id,
                    IsOnline = await IsOnlineAsync(id)
                });
            }
            return statuses;
        }        

        public async Task<UserInfoDTO> GetUserInfoAsync(int userId)
        {
            if (userId > 0)
            {
                User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null)
                {
                    var userInfo = new UserInfoDTO()
                    {
                        Avatar = user.Image,
                        Id = user.Id,
                        Nickname = user.Nickname,
                        Status = user.Status,
                        OnlineStatus = await IsOnlineAsync(user.Id)
                    };
                    return userInfo;
                }
            }
            return null;
        }
    }
}
