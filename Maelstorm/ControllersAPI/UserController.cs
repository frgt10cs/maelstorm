using System.Threading.Tasks;
using Maelstorm.Extensions;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Maelstorm.Dtos;

namespace Maelstorm.ControllersAPI
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController : Controller
    {        
        private IUserService userServ;        
        public UserController(IUserService userServ)
        {            
            this.userServ = userServ;            
        }                

        [HttpGet]
        [ActionName("GetUserInfo")]
        public async Task<JsonResult> GetUserInfo(int userId)
        {
            return Json(await userServ.GetUserInfoAsync(userId));
        }                
    }
}