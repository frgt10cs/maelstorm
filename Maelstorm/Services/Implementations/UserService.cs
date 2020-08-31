using Maelstorm.Database;
using Maelstorm.Entities;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Responses;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class UserService : IUserService
    {
        private MaelstormContext context;
        private ISignalRSessionService signalSessionServ;
        public UserService(MaelstormContext context, ISignalRSessionService signalSessionServ)
        {
            this.context = context;
            this.signalSessionServ = signalSessionServ;
        }                

        public async Task<UserInfo> GetUserInfoAsync(int userId)
        {
            if (userId > 0)
            {
                User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null)
                {
                    var userInfo = new UserInfo()
                    {
                        Avatar = user.Image,
                        Id = user.Id,
                        Nickname = user.Nickname,
                        Status = user.Status,
                        OnlineStatus = await signalSessionServ.IsOnlineAsync(user.Id.ToString())
                    };
                    return userInfo;
                }
            }
            return null;
        }
    }
}
