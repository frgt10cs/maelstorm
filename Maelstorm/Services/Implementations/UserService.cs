using Maelstorm.Database;
using Maelstorm.Hubs;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.ViewModels;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class UserService : IUserService
    {
        private MaelstormRepository context;
        private IDistributedCache cache;
        private IOptions<JwtOptions> jwtOptions;
        private IHubContext<MessageHub> messHub;
        public UserService(MaelstormRepository context, IDistributedCache cache,
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
                var sessions = await cache.GetListAsync<SignalRSession>(userId.ToString());
                SignalRSession signalRSession = sessions.LastOrDefault(s => s.SessionId == session.SessionId);
                if (signalRSession != null)
                {
                    await cache.RemoveFromListAsync<SignalRSession>(userId.ToString(), signalRSession);
                    await messHub.Clients.Client(signalRSession.ConnectionId).SendAsync("OnSessionClosed");
                }
                await cache.SetStringAsync("sc:" + session.SessionId, "sessionIsClosed", new DistributedCacheEntryOptions()
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(jwtOptions.Value.ExpiryMinutes)
                });
                
                if (banDevice)
                {
                    context.BannedDevices.Add(new BannedDevice() { UserId = userId, Fingerprint = session.FingerPrint });
                }
                context.Sessions.Remove(session);
                await context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsOnlineAsync(int id)
        {
            return await cache.GetAsync(id.ToString()) != null;
        }

        public async Task<List<OnlineStatusViewModel>> GetOnlineStatusesAsync(params int[] ids)
        {
            var statuses = new List<OnlineStatusViewModel>();
            foreach(int id in ids)
            {
                statuses.Add(new OnlineStatusViewModel()
                {
                    UserId = id,
                    IsOnline = await IsOnlineAsync(id)
                });
            }
            return statuses;
        }

        public async Task<List<SessionViewModel>> GetSessionsAsync(int userId)
        {
            List<SessionViewModel> models = new List<SessionViewModel>();
            var sessions = context.Sessions.Where(s => s.UserId == userId);
            var signalRSessions = await cache.GetListAsync<SignalRSession>(userId.ToString());
            foreach (Session session in sessions)
            {
                models.Add(new SessionViewModel()
                {
                    Session = session,
                    SignalRSession = signalRSessions?.FirstOrDefault(s => s.Fingerprint == session.FingerPrint)
                });
            }
            return models;
        }

        public async Task<UserInfoViewModel> GetUserInfoAsync(int userId)
        {
            if (userId > 0)
            {
                User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null)
                {
                    var userInfo = new UserInfoViewModel()
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
