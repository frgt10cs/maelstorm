using System;
using System.Threading.Tasks;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using MaelstormDTO.Requests;

namespace Maelstorm.Controllers
{
    [Route("[controller]/[action]")]    
    public class AccountController : Controller
    {
        private IAccountService accServ;
        private IAuthenticationService authServ;
        public AccountController(IAccountService accServ, IAuthenticationService authServ)
        {
            this.accServ = accServ;
            this.authServ = authServ;
        }        
        
        [HttpGet("{token}")]        
        [ActionName("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string token)
        {

            ServiceResult result = null;
            if (!String.IsNullOrWhiteSpace(token) && token.Length>=10 && token.Length<=20)
            {
                result = await accServ.ConfirmEmailAsync(token);                                                             
            }
            return View("Result", result);
        }
             
        [HttpGet]
        [ActionName("Registration")]
        public IActionResult Registration()
        {
            return View();
        }

        [HttpPost]
        [ActionName("Registration")]
        public async Task<IActionResult> Registration(RegistrationRequest registrationRequest)
        {
            ServiceResult result;
            if (ModelState.IsValid)
            {
                result = await accServ.RegistrationAsync(registrationRequest);               
            }
            else
            {
                result = new ServiceResult(ModelState);
            }
            return View("Result", result);               
        }

        [HttpGet]
        [ActionName("Login")]
        public IActionResult Login()
        {
            return View();
        }        
    }
}
