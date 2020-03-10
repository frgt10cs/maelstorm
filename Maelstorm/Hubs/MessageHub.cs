using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Maelstorm.Hubs
{
    public class MessageHub : Hub
    {
        private IAuthenticationService authServ;
        private ILogger<MessageHub> logger;
        private IDistributedCache cache;
        public MessageHub(IAuthenticationService authServ, IDistributedCache cache, ILogger<MessageHub> logger)
        {
            this.authServ = authServ;
            this.logger = logger;
            this.cache = cache;
        }

        private bool IsAuthorized()
        {
            var value = Context.Items["Auth"];
            // more checkings?
            return value != null && (bool)value;
        }

        public async Task Ping()
        {            
            await Clients.Caller.SendAsync("Ping", IsAuthorized());
        }

        public async Task Authorize(string token, string signalRFingerprint)
        {
            if (!IsAuthorized())
            {
                var result = authServ.ValidateToken(token, true);
                if (result.IsSuccessful)
                {
                    ClaimsIdentity identity = new ClaimsIdentity(result.Principial.Identity);
                    string fingerprint = identity.FindFirst("Fingerprint").Value;
                    if (fingerprint == signalRFingerprint)
                    {
                        string userId = identity.FindFirst("UserId").Value;
                        string sessionId =  identity.FindFirst("SessionId").Value;
                        string ip = Context.GetHttpContext().Connection.RemoteIpAddress.ToString();
                        Context.Items.Add("Auth", true);
                        Context.Items.Add("UserId", userId);
                        Context.Items.Add("Fingerprint", fingerprint);
                        Context.Items.Add("Ip", ip);
                        Context.Items.Add("SessionId", sessionId);
                        // await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                        SignalRSession session = new SignalRSession()
                        {
                            UserId = Int32.Parse(userId),
                            SessionId = sessionId,
                            Fingerprint = fingerprint,
                            Ip = ip,
                            ConnectionId = Context.ConnectionId,
                            StartedAt = DateTime.Now
                        };
                        await cache.AddToListAsync(userId, session);
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
                string fingerprint = Context.Items["Fingerprint"].ToString();
                await cache.RemoveFromListAsync<SignalRSession>(Context.Items["UserId"].ToString(), s => s.Fingerprint == fingerprint);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
