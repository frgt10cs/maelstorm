using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{    
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController:ControllerBase
    {
        private IAuthenticationService authenticationService;
        private readonly IJwtService jwtService;
        public AuthenticationController(IAuthenticationService authenticationService, IJwtService jwtService)
        {
            this.authenticationService = authenticationService;
            this.jwtService = jwtService;
        }

        [HttpPost]        
        public async Task<ServiceResult> Authenticate([FromBody]AuthenticationRequest authenticationRequest)
        {
            return await authenticationService.AuthenticateAsync(authenticationRequest, HttpContext.Connection.RemoteIpAddress.ToString());
        }

        [HttpPost("refresh")]
        public async Task<ServiceResult> Refresh([FromBody]RefreshTokenRequest refreshTokenRequest)
        {
            ServiceResult result = ModelState.IsValid ? await jwtService.RefreshTokenAsync(refreshTokenRequest, HttpContext.Connection.RemoteIpAddress.ToString())
               : new ServiceResult(ModelState);
            return result;
        }
    }
}
