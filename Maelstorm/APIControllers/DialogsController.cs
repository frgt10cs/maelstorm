using Maelstorm.Dtos;
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
        public async Task<List<DialogDTO>> GetDialogs(int offset, int count)
        {
            return await dialogService.GetDialogsAsync(HttpContext.GetUserId(), offset, count);
        }

        [HttpGet("{interlocutorId}")]
        public async Task<DialogDTO> GetDialog(int interlocutorId)
        {
            return await dialogService.GetOrCreateDialogAsync(HttpContext.GetUserId(), interlocutorId);
        }        

        [HttpGet("{dialogId}/readed-messages")]      
        public async Task<List<MessageDTO>> GetReadedDialogMessages(int dialogId, int offset, int count)
        {
            return await dialogService.GetReadedDialogMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpGet("{dialogId}/unreaded-messages")]
        public async Task<List<MessageDTO>> GetUnreadedMessages(int dialogId, int offset, int count)
        {
            return await dialogService.GetUnreadedDialogMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpPost("{dialogId}/messages")]
        public async Task<ServiceResult> SendMessaged(int interlocutorId, [FromBody]MessageSendDTO message)
        {
            // TODO: check replyId
            ServiceResult result = ModelState.IsValid ? await dialogService.SendDialogMessageAsync(HttpContext.GetUserId(), interlocutorId, message)
                : new ServiceResult(ModelState);
            return result;
        }
    }
}
