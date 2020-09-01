using Maelstorm.Extensions;
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
        public async Task<IEnumerable<Message>> GetReadedMessages([FromQuery]int dialogId, [FromQuery]int offset, [FromQuery]int count)
        {
            return await dialogService.GetReadedMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpGet("new")]
        public async Task<IEnumerable<Message>> GetUnreadedMessages([FromQuery]int dialogId, [FromQuery]int offset, [FromQuery]int count)
        {
            return await dialogService.GetUnreadedMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpPost]
        public async Task<DeliveredMessageInfo> SendMessage([FromBody]SendMessageRequest message)
        {
            return await dialogService.SendDialogMessageAsync(message, HttpContext.GetUserId());
        }
    }
}
