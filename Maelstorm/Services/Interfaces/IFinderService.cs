using Maelstorm.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IFinderService
    {
        Task<List<UserFindInfoViewModel>> FindUsersByNicknameAsync(int userId, string nickname);
    }
}
