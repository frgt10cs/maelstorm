using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ISessionService
{
    Task<bool> IsSessionClosedAsync(string userId, string sessionId);
    public Task<List<SessionDTO>> GetSessionsAsync(int userId, int offset, int count);
    public Task<SessionDTO> GetSessionAsync(int userId, string sessionId);
    public Task CloseSessionAsync(int userId, string sessionId, bool banDevice = false);
}