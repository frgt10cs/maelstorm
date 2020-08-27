using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Database;
using Maelstorm.Dtos;
using Maelstorm.Entities;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Responses;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis.Extensions.Core.Abstractions;

public class SessionService : ISessionService
{
    private IRedisCacheClient cache;
    private MaelstormContext context;
    private ISignalRSessionService signalSessionServ;
    private ILogger<SessionService> logger;
    public SessionService(IRedisCacheClient cache, MaelstormContext context, ISignalRSessionService signalSessionServ, ILogger<SessionService> logger)
    {
        this.cache = cache;
        this.context = context;
        this.signalSessionServ = signalSessionServ;
        this.logger = logger;
    }
    public async Task<bool> IsSessionClosedAsync(string userId, string sessionId)
    {        
        return string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(sessionId) ||
                !string.IsNullOrEmpty(await cache.Db2.GetAsync<string>(sessionId));
    }

    public async Task<List<UserSessions>> GetSessionsAsync(int userId, int offset, int count)
    {
        List<UserSessions> models = new List<UserSessions>();
        var sessions = context.Sessions.Where(s => s.UserId == userId).Skip(offset).Take(count);
        var connectionIds = await cache.Db0.HashValuesAsync<string>(userId.ToString());
        var signalRSessions = (await cache.Db1.GetAllAsync<SignalRSession>(connectionIds)).Values;
        foreach (var session in sessions)
        {
            models.Add(new UserSessions()
            {
                Session = session,
                SignalRSession = signalRSessions?.FirstOrDefault(s => s.Fingerprint == session.FingerPrint)
            });
        }
        return models;
    }

    public async Task CloseSessionAsync(int userId, string sessionId, bool banDevice = false)
    {
        Session session = await context.Sessions.FirstOrDefaultAsync(s => s.SessionId == sessionId && s.UserId == userId);
        string userIdStr = userId.ToString();
        var connectionId = await cache.Db0.HashGetAsync<string>(userIdStr, sessionId);
        if (!string.IsNullOrEmpty(connectionId))
        {
            await signalSessionServ.CloseSessionAsync(connectionId);
            await cache.Db0.HashDeleteAsync(userIdStr, sessionId);
        }
        await cache.Db2.AddAsync(sessionId, "closed", TimeSpan.FromMinutes(5));
        if (banDevice)
        {
            context.BannedDevices.Add(new BannedDevice() { UserId = userId, Fingerprint = session.FingerPrint });
        }
        context.Sessions.Remove(session);
        await context.SaveChangesAsync();
    }

    public async Task<UserSessions> GetSessionAsync(int userId, string sessionId)
    {
        var session = await context.Sessions.FindAsync(sessionId);
        UserSessions sessionInfo = null;


        if (session.UserId == userId)
        {
            var connectionIds = await cache.Db0.HashValuesAsync<string>(userId.ToString());
            var signalRSession = (await cache.Db1.GetAllAsync<SignalRSession>(connectionIds)).Values.FirstOrDefault(s => s.SessionId == sessionId);
            sessionInfo = new UserSessions()
            {
                Session = session,
                SignalRSession = signalRSession
            };            
        }
        else
        {
            logger.LogWarning($"User {userId} tried to get {session.UserId} session");
        }        
        return sessionInfo;
    }
}