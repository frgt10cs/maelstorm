using Maelstorm.Models;
using Maelstorm.Dtos;
using System.Threading.Tasks;
using MaelstormDTO.Requests;

namespace Maelstorm.Services.Interfaces
{
    public interface IAccountService
    {
        Task<ServiceResult> RegistrationAsync(RegistrationRequest model);
        Task<ServiceResult> ConfirmEmailAsync(string token);        
    }
}
