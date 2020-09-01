using Maelstorm.Models;
using System.Threading.Tasks;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;

namespace Maelstorm.Services.Interfaces
{
    public interface IAccountService
    {
        Task<ServerResponse> RegistrationAsync(RegistrationRequest model);
        Task<ServerResponse> ConfirmEmailAsync(string token);        
    }
}
