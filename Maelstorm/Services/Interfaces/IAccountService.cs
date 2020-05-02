using Maelstorm.Models;
using Maelstorm.Dtos;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IAccountService
    {
        Task<ServiceResult> RegistrationAsync(RegistrationDTO model);
        Task<ServiceResult> ConfirmEmailAsync(string token);        
    }
}
