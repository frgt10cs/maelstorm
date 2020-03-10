using System;
using System.Threading.Tasks;
using Maelstorm.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

public class SessionService : ISessionService
{
    private IDistributedCache cache;
    public SessionService(IDistributedCache cache)
    {
        this.cache = cache;
    }
    public async Task<bool> IsSessionClosed(string sessionId)
    {
        if (!String.IsNullOrWhiteSpace(sessionId))
        {
            return  !String.IsNullOrEmpty(await cache.GetStringAsync("sc:" + sessionId));                
        }
        return true;
    }
}