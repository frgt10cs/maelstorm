using Maelstorm.Dtos;
using Maelstorm.Entities;
using Maelstorm.Extensions;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DialogController:ControllerBase
    {
        private IDialogService dialogService;
        public DialogController(IDialogService dialogService)
        {
            this.dialogService = dialogService;
        }

        [HttpGet]
        [ActionName("dialogs")]
        public async Task<DialogDTO> GetDialog(int interlocutorId)
        {
            return await dialogService.GetOrCreateDialogAsync(HttpContext.GetUserId(), interlocutorId);
        }

        [HttpGet]
        [ActionName("dialogs")]
        public async Task<List<DialogDTO>> GetDialogs(int offset, int count)
        {
            return await dialogService.GetDialogsAsync(HttpContext.GetUserId(), offset, count);
        }
    }
}
