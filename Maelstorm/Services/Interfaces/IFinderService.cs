using Maelstorm.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IFinderService
    {
        Task<List<UserFindInfoDTO>> FindUserByLoginAsync(string login);
    }
}