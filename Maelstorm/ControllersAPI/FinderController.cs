using Maelstorm.Extensions;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.ControllersAPI
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]/[action]")]
    public class FinderController:ControllerBase
    {
        private IFinderService findServ;
        public FinderController(IFinderService findServ)
        {
            this.findServ = findServ;
        }

        [HttpGet]
        [ActionName("FindUser")]
        public async Task<ActionResult<List<UserFindInfoDTO>>> FindUser(string nickname)
        {
            return await findServ.FindUsersByNicknameAsync(HttpContext.GetUserId(),nickname);
        }
    }
}
