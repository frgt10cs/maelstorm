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
        [ActionName("FindUserByLogin")]
        public async Task<ActionResult<List<UserFindInfoDTO>>> FindUserByLogin(string login)
        {
            return await findServ.FindUserByLoginAsync(login);
        }

        [HttpGet]
        [ActionName("FindMessage")]
        public async Task<ActionResult<List<MessageSearchResult>>> FindMessage(string message)
        {
            return await findServ.FindMessageAsync(message);
        }
    }
}
