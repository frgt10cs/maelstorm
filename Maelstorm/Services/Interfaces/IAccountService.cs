using Maelstorm.Models;
using Maelstorm.ViewModels;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IAccountService
    {
        Task<ServiceResult> RegistrationAsync(RegistrationViewModel model);
        Task<ServiceResult> ConfirmEmailAsync(string token);        
    }
}
