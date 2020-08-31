using Maelstorm.Entities;
using Maelstorm.Extensions;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dialog = MaelstormDTO.Responses.Dialog;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DialogsController:ControllerBase
    {
        private IDialogService dialogService;
        public DialogsController(IDialogService dialogService)
        {
            this.dialogService = dialogService;
        }

        [HttpGet]
        public async Task<List<Dialog>> GetDialogs([FromQuery]int offset, [FromQuery]int count)
        {
            return await dialogService.GetDialogsAsync(HttpContext.GetUserId(), offset, count);
        }

        [HttpGet("{interlocutorId}")]
        public async Task<Dialog> GetDialog(int interlocutorId)
        {
            return await dialogService.GetDialogAsync(HttpContext.GetUserId(), interlocutorId);
        }        
    }
}
