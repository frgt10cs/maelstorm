using Maelstorm.Models;
using Maelstorm.DTO;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IAccountService
    {
        Task<ServiceResult> RegistrationAsync(RegistrationDTO model);
        Task<ServiceResult> ConfirmEmailAsync(string token);        
    }
}
