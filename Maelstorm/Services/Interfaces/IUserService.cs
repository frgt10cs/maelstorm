using MaelstormDTO.Responses;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfo> GetUserInfoAsync(int userId);               
    }
}
