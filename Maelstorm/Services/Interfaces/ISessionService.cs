using System;
using System.Threading.Tasks;

public interface ISessionService
{
    Task<bool> IsSessionClosed(string sessionId);
}