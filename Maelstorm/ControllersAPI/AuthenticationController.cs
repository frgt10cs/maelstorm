using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Maelstorm.Extensions;

namespace Maelstorm.ControllersAPI
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/[controller]/[action]")]    
    public class AuthenticationController : ControllerBase
    {
        private IAuthenticationService authServ;        
        public AuthenticationController(IAuthenticationService authServ)
        {
            this.authServ = authServ;            
        }

        [HttpPost]
        [ActionName("auth")]
        public async Task<ActionResult<ServiceResult>> Authenticate([FromBody]AuthenticationDTO model)
        {            
            ServiceResult result;
            if (ModelState.IsValid)
            {
                result = await authServ.AuthenticateAsync(model, HttpContext.Connection.RemoteIpAddress.ToString());
            }
            else
            {                
                result = new ServiceResult(ModelState);
            }
            return result;
        }
        
        [HttpPost]
        [ActionName("rfrshtkn")]
        public async Task<ActionResult<ServiceResult>> RefreshToken([FromBody]RefreshTokenDTO model)
        {
            ServiceResult result;
            if (ModelState.IsValid)
            {
                result = await authServ.RefreshToken(model, HttpContext.Connection.RemoteIpAddress.ToString());                
            }
            else
            {
                result = new ServiceResult(ModelState);
            }
            return result;
        }
    }
}