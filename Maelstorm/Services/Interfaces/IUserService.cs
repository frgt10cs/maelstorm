using Maelstorm.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfoViewModel> GetUserInfoAsync(int userId);
        Task<List<SessionViewModel>> GetSessionsAsync(int userId);
        Task CloseSessionAsync(int userId, string sessionId, bool banDevice = false);
        Task<bool> IsOnlineAsync(int id);
        Task<List<OnlineStatusViewModel>> GetOnlineStatusesAsync(int[] ids);
    }
}
