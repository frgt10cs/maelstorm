using Maelstorm.Dtos;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private IUserService userService;
        public UserController(IUserService userService)
        {
            this.userService = userService;
        }

        [HttpGet("{id}")]        
        public async Task<UserInfoDTO> GetUserInfo(int id)
        {
            return await userService.GetUserInfoAsync(id);
        }
    }
}
