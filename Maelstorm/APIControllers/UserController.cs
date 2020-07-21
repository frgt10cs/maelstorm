using Maelstorm.Dtos;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController:ControllerBase
    {
        private IUserService userService;
        public UserController(IUserService userService)
        {
            this.userService = userService;
        }        

        [HttpGet]
        [ActionName("Users")]
        public async Task<UserInfoDTO> GetUserInfo(int userId)
        {
            return await userService.GetUserInfoAsync(userId);
        }
    }
}
