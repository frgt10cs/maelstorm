using Maelstorm.Database;
using Maelstorm.Services.Interfaces;
using Maelstorm.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class FinderService : IFinderService
    {
        private MaelstormContext context;
        private ISignalRSessionService signalRSessionService;
        public FinderService(MaelstormContext context, ISignalRSessionService signalRSessionService)
        {
            this.context = context;
            this.signalRSessionService = signalRSessionService;
        }

        public async Task<List<UserFindInfoDTO>> FindUsersByNicknameAsync(int userId, string nickname)
        {            
            var users = await context.Users
                .Where(u => u.Nickname.Contains(nickname) && u.Id != userId)
                .Select(u => new UserFindInfoDTO
                {
                    Status  = u.Status,
                    Id = u.Id,
                    MiniAvatar =  u.Image,
                    Nickname = u.Nickname                    
                })
                .ToListAsync();
            foreach (var user in users)
                user.IsOnline = await signalRSessionService.IsOnlineAsync(user.Id.ToString());
            return users;
        }        
    }
}
