using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController:ControllerBase
    {
        private IAccountService accountService;
        public AccountController(IAccountService accountService)
        {
            this.accountService = accountService;
        }

        [HttpPost("registration")]
        public async Task<IActionResult> Registration([FromBody]RegistrationRequest registrationRequest)
        {
            var result  = await accountService.RegistrationAsync(registrationRequest);
            if(result.Ok)
                return Ok();
            return BadRequest(result.ProblemDetails);          
        }
    }
}
