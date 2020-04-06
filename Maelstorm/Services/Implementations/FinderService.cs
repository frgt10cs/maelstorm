using Maelstorm.Database;
using Maelstorm.Services.Interfaces;
using Maelstorm.DTO;
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
        public FinderService(MaelstormContext context)
        {
            this.context = context;
        }

        public async Task<List<UserFindInfoDTO>> FindUsersByNicknameAsync(int userId, string nickname)
        {            
            var users = await context.Users
                .Where(u => u.Nickname.Contains(nickname) && u.Id != userId)
                .Select(u => new UserFindInfoDTO
                {
                    Id = u.Id,
                    MiniAvatar =  u.Image,
                    Nickname = u.Nickname
                })
                .ToListAsync();            
            return users;
        }        
    }
}
