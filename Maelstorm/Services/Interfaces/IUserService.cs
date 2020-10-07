using MaelstormDTO.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfo> GetUserInfoAsync(int userId);
        Task<List<UserInfo>> GetUsersInfo(string query, int offset, int count);
    }
}
