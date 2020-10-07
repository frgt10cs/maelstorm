using Maelstorm.Database;
using Maelstorm.Entities;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Responses;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<List<UserInfo>> GetUsersInfo(string query, int offset = 0, int count = 50)
        {
            var users = context.Users.AsQueryable();
            if (!string.IsNullOrWhiteSpace(query))
                users = users.Where(u => u.Nickname.Contains(query));
            var usersInfos = await users.Skip(offset).Take(count).Select(u => new UserInfo()
            {
                Id = u.Id,
                Avatar = u.Image,
                Nickname = u.Nickname,
                Status = u.Status
            }).ToListAsync();
            foreach (var user in usersInfos)
                user.OnlineStatus = await signalSessionServ.IsOnlineAsync(user.Id.ToString());
            return usersInfos;
        }
    }
}
