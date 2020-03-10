using Maelstorm.Models;
using Maelstorm.Services.Implementations;
using Maelstorm.Services.Interfaces;
using Maelstorm.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.ControllersAPI
{    
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class AccountController:ControllerBase
    {
        private IAccountService accServ;
        public AccountController(IAccountService accServ)
        {
            this.accServ = accServ;
        }

        [HttpPost]
        [ActionName("Registration")]
        public async Task<ActionResult<ServiceResult>> Registration([FromBody]RegistrationViewModel model)
        {
            ServiceResult result;
            if (ModelState.IsValid)
            {
                result = await accServ.RegistrationAsync(model);
            }
            else
            {
                result = new ServiceResult(ModelState);
            }
            return result;
        }
    }
}
