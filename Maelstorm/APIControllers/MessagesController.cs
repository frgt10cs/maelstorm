using Maelstorm.Extensions;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Message = MaelstormDTO.Responses.Message;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController:ControllerBase
    {
        private IDialogService dialogService;
        public MessagesController(IDialogService dialogService)
        {
            this.dialogService = dialogService;
        }

        [HttpGet("readed")]
        public async Task<ActionResult<IEnumerable<Message>>> GetReadedMessages([FromQuery]int dialogId, [FromQuery]int offset, [FromQuery]int count)
        {
            return await dialogService.GetReadedMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);            
        }

        [HttpGet("unreaded")]
        public async Task<ActionResult<IEnumerable<Message>>> GetUnreadedMessages([FromQuery]int dialogId, [FromQuery]int offset, [FromQuery]int count)
        {            
            return await dialogService.GetUnreadedMessagesAsync(HttpContext.GetUserId(), dialogId, offset, count);
        }

        [HttpPost]
        public async Task<ActionResult<DeliveredMessageInfo>> SendMessage([FromBody]SendMessageRequest message)
        {
            return await dialogService.SendDialogMessageAsync(message, HttpContext.GetUserId());
        }
    }
}
