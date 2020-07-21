using Maelstorm.Dtos;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{    
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController:ControllerBase
    {
        private IAuthenticationService authenticationService;
        public AuthenticationController(IAuthenticationService authenticationService)
        {
            this.authenticationService = authenticationService;
        }

        [HttpPost]        
        public async Task<ServiceResult> Authenticate([FromBody]AuthenticationDTO model)
        {
            var result = ModelState.IsValid ?
                await authenticationService.AuthenticateAsync(model, HttpContext.Connection.RemoteIpAddress.ToString())
                : new ServiceResult(ModelState);            
            return result;
        }
    }
}
