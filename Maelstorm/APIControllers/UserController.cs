using Maelstorm.Services.Interfaces;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private IUserService userService;
        public UserController(IUserService userService)
        {
            this.userService = userService;
        }

        [HttpGet]
        public async Task<List<UserInfo>> GetUsersInfo(
            [FromQuery] string query = "",
            [FromQuery] int offset = 0,
            [FromQuery] int count = 50)
        {
            return await userService.GetUsersInfo(query, offset, count);
        }

        [HttpGet("{id}")]
        public async Task<UserInfo> GetUserInfo(int id)
        {
            return await userService.GetUserInfoAsync(id);
        }
    }
}
