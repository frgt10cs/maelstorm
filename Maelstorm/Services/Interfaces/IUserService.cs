using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfoDTO> GetUserInfoAsync(int userId);               
    }
}
