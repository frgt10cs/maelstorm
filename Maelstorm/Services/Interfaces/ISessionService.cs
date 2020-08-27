using Maelstorm.Dtos;
using MaelstormDTO.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ISessionService
{
    Task<bool> IsSessionClosedAsync(string userId, string sessionId);
    public Task<List<UserSessions>> GetSessionsAsync(int userId, int offset, int count);
    public Task<UserSessions> GetSessionAsync(int userId, string sessionId);
    public Task CloseSessionAsync(int userId, string sessionId, bool banDevice = false);
}