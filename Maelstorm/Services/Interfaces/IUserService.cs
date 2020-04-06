using Maelstorm.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfoDTO> GetUserInfoAsync(int userId);
        Task<List<SessionDTO>> GetSessionsAsync(int userId);
        Task CloseSessionAsync(int userId, string sessionId, bool banDevice = false);
        Task<bool> IsOnlineAsync(int id);
        Task<List<OnlineStatusDTO>> GetOnlineStatusesAsync(int[] ids);
    }
}
