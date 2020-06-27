using Maelstorm.Database;
using Maelstorm.Entities;
using Maelstorm.Hubs;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.Dtos;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StackExchange.Redis.Extensions.Core.Abstractions;

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

        public async Task<UserInfoDTO> GetUserInfoAsync(int userId)
        {
            if (userId > 0)
            {
                User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null)
                {
                    var userInfo = new UserInfoDTO()
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
