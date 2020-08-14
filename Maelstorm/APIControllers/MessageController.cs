using Maelstorm.Dtos;
using Maelstorm.Extensions;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Maelstorm.APIControllers
{
    public class MessageController:ControllerBase
    {
        private IDialogService dialogService;
        public MessageController(IDialogService dialogService)
        {
            this.dialogService = dialogService;
        }

        [HttpGet("old")]
        public async Task<List<MessageDTO>> GetReadedMessages(int dialogId, int offset, int count)
        {
            return await dialogService.GetReadedDialogMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpGet("new")]
        public async Task<List<MessageDTO>> GetUnreadedMessages(int dialogId, int offset, int count)
        {
            return await dialogService.GetUnreadedDialogMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpPost]
        public async Task<ServiceResult> SendMessage(MessageSendDTO message)
        {
            ServiceResult result = ModelState.IsValid ?
                await dialogService.SendDialogMessageAsync(HttpContext.GetUserId(), message)
               : new ServiceResult(ModelState);
            return result;
        }
    }
}
