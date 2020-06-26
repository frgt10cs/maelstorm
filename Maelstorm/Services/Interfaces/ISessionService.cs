using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ISessionService
{
    Task<bool> IsSessionClosedAsync(string sessionId);
    public Task<List<SessionDTO>> GetSessionsAsync(int userId);
}