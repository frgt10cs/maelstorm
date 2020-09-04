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
        public async Task<ActionResult<AuthenticationResult>> Authenticate([FromBody]AuthenticationRequest authenticationRequest)
        {
            var result = await authenticationService.AuthenticateAsync(authenticationRequest, HttpContext.Connection.RemoteIpAddress.ToString());
            if(result == null)
            {
                var problemDetails = new ProblemDetails
                {
                    Detail = "Incorrect login or password"
                };
                return BadRequest(problemDetails);
            }
            return result;
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<Tokens>> Refresh([FromBody]RefreshTokenRequest refreshTokenRequest)
        {
            var tokens =  await jwtService.RefreshTokenAsync(refreshTokenRequest, HttpContext.Connection.RemoteIpAddress.ToString());
            if(tokens == null)
            {
                var problemDetails = new ProblemDetails
                {
                    Detail = "Invalid token"
                };
                return BadRequest(problemDetails);
            }            
            return tokens;
        }
    }
}
