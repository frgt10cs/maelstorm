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
        [ActionName("GetUserData")]
        public JsonResult GetUserData()
        {
            return Json(new ServiceResult() { Data = HttpContext.User.FindFirst("UserEmail").Value });
        }
        
        [ActionName("Logout")]
        public async Task Logout()
        {
            await userServ.CloseSessionAsync(HttpContext.GetUserId(), HttpContext.User.FindFirst("SessionId").Value);
        }

        [HttpGet]
        [ActionName("GetUserInfo")]
        public async Task<JsonResult> GetUserInfo(int userId)
        {
            return Json(await userServ.GetUserInfoAsync(userId));
        }

        [HttpGet]
        [ActionName("GetSessions")]
        public async Task<JsonResult> GetSessions()
        {
            return Json(await userServ.GetSessionsAsync(HttpContext.GetUserId()));
        }

        [HttpPost]
        [ActionName("CloseSession")]
        public async Task CloseSession(CloseSessionDTO model)
        {
            await userServ.CloseSessionAsync(HttpContext.GetUserId(), model.SessionId, model.BanDevice);
        }

        [HttpPost]
        [ActionName("GetOnlineStatuses")]
        public async Task<JsonResult> GetOnlineStatus(int[] ids)
        {
            return Json(await userServ.GetOnlineStatusesAsync(ids));
        }
    }
}