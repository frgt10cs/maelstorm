using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using StackExchange.Redis.Extensions.Core.Abstractions;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Maelstorm.Hubs
{      
    public class MessageHub : Hub
    {        
        private ILogger<MessageHub> logger;
        private IRedisCacheClient cache;
        private IJwtService jwtService;
        public MessageHub(ILogger<MessageHub> logger, IRedisCacheClient cache, IJwtService jwtService)
        {            
            this.logger = logger;
            this.cache = cache;           
            this.jwtService = jwtService;
        }

        private async Task<bool> IsAuthorized()
        {
            if (Context.Items.Count == 0) return false;
            return await cache.Db1.ExistsAsync(Context.ConnectionId);
        }
        
        public async Task Ping()
        {            
            await Clients.Caller.SendAsync("Ping", await IsAuthorized());
        }

        public async Task Authorize(string token, string signalRFingerprint)
        {
            if (!await IsAuthorized())
            {                
                var result = jwtService.ValidateToken(token, true);
                if (result.IsSuccessful)
                {
                    ClaimsIdentity identity = new ClaimsIdentity(result.Principial.Identity);
                    string fingerprint = identity.FindFirst("Fingerprint").Value;
                    if (fingerprint == signalRFingerprint)
                    {
                        string userId = identity.FindFirst("UserId").Value;
                        string sessionId =  identity.FindFirst("SessionId").Value;
                        string ip = Context.GetHttpContext().Connection.RemoteIpAddress.ToString();

                        Context.Items["UserId"] = userId;
                        Context.Items["Fingerprint"] = fingerprint;
                        Context.Items["Ip"] = ip;
                        Context.Items["SessionId"] = sessionId;  
                        
                        SignalRSession session = new SignalRSession()
                        {
                            UserId = Int32.Parse(userId),
                            SessionId = sessionId,
                            Fingerprint = fingerprint,
                            Ip = ip,
                            ConnectionId = Context.ConnectionId,
                            StartedAt = DateTime.Now
                        };

                        await cache.Db0.HashSetAsync(userId, sessionId, Context.ConnectionId);                        
                        await cache.Db1.AddAsync(Context.ConnectionId, session);                        
                    }
                    else
                    {
                        logger.LogWarning("Hub auth fail. Fingerprints are not same. Token: " + token);
                        await Clients.Caller.SendAsync("OnHubAuthFalied", "Token doesn't belong this device.");
                    }
                }
                else
                {
                    logger.LogWarning("Hub auth fail. Token: " + token);
                    await Clients.Caller.SendAsync("OnHubAuthFalied", "Invalid token.");
                }
            }
        }        

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            if (Context.Items.Any())
            {
                string userId = Context.Items["UserId"].ToString();
                string connectionId = Context.ConnectionId;
                string sessionId = Context.Items["SessionId"].ToString();

                await cache.Db0.HashDeleteAsync(userId, sessionId);
                await cache.Db1.RemoveAsync(connectionId);          
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
