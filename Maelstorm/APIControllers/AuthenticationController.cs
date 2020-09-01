using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
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
        public async Task<AuthenticationResult> Authenticate([FromBody]AuthenticationRequest authenticationRequest)
        {
            return await authenticationService.AuthenticateAsync(authenticationRequest, HttpContext.Connection.RemoteIpAddress.ToString());
        }

        [HttpPost("refresh")]
        public async Task<Tokens> Refresh([FromBody]RefreshTokenRequest refreshTokenRequest)
        {
            return await jwtService.RefreshTokenAsync(refreshTokenRequest, HttpContext.Connection.RemoteIpAddress.ToString());
        }
    }
}
