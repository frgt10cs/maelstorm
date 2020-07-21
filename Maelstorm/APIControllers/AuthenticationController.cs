using Maelstorm.Dtos;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthenticationController:ControllerBase
    {
        private IAuthenticationService authenticationService;
        public AuthenticationController(IAuthenticationService authenticationService)
        {
            this.authenticationService = authenticationService;
        }

        [HttpPost]
        [ActionName("authenticate")]
        public async Task<ServiceResult> Authenticate([FromBody]AuthenticationDTO model)
        {
            var result = ModelState.IsValid ?
                await authenticationService.AuthenticateAsync(model, HttpContext.Connection.RemoteIpAddress.ToString())
                : new ServiceResult(ModelState);            
            return result;
        }
    }
}
