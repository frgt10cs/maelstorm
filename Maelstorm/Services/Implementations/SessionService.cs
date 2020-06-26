using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Database;
using Maelstorm.Dtos;
using Maelstorm.Entities;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis.Extensions.Core.Abstractions;

public class SessionService : ISessionService
{
    private IRedisCacheClient cache;
    private MaelstormContext context;
    public SessionService(IRedisCacheClient cache, MaelstormContext context)
    {
        this.cache = cache;
        this.context = context;
    }
    public async Task<bool> IsSessionClosedAsync(string sessionId)
    {
        if (!String.IsNullOrWhiteSpace(sessionId))
        {
            return await cache.Db0.SetContainsAsync("closedSessions", sessionId);     
        }
        return true;
    }

    public async Task<List<SessionDTO>> GetSessionsAsync(int userId)
    {
        List<SessionDTO> models = new List<SessionDTO>();
        var sessions = context.Sessions.Where(s => s.UserId == userId);
        var connectionIds = await cache.Db0.HashValuesAsync<string>(userId.ToString());
        var signalRSessions = (await cache.Db0.GetAllAsync<SignalRSession>(connectionIds)).Values;
        foreach (Session session in sessions)
        {
            models.Add(new SessionDTO()
            {
                Session = session,
                SignalRSession = signalRSessions?.FirstOrDefault(s => s.Fingerprint == session.FingerPrint)
            });
        }
        return models;
    }
}