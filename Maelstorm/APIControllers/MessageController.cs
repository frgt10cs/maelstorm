using Maelstorm.Dtos;
using Maelstorm.Extensions;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Message = MaelstormDTO.Responses.Message;

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
        public async Task<List<Message>> GetReadedMessages([FromQuery]int dialogId, [FromQuery]int offset, [FromQuery]int count)
        {
            return await dialogService.GetReadedDialogMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpGet("new")]
        public async Task<List<Message>> GetUnreadedMessages([FromQuery]int dialogId, [FromQuery]int offset, [FromQuery]int count)
        {
            return await dialogService.GetUnreadedDialogMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpPost]
        public async Task<DeliveredMessageInfo> SendMessage(SendMessageRequest message)
        {
            return await dialogService.SendDialogMessageAsync(HttpContext.GetUserId(), message);
        }
    }
}
