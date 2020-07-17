using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IFinderService
    {
        Task<List<UserFindInfoDTO>> FindUserByLoginAsync(string login);
        Task<List<MessageSearchResult>> FindMessageAsync(string message);
    }
}
