using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
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
        public async Task<ServiceResult> Registration([FromBody]RegistrationRequest registrationRequest)
        {
            return await accountService.RegistrationAsync(registrationRequest);
        }
    }
}
