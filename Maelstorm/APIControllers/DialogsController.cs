using Maelstorm.Extensions;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dialog = MaelstormDTO.Responses.Dialog;

namespace Maelstorm.APIControllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DialogsController : ControllerBase
    {
        private IDialogService dialogService;
        public DialogsController(IDialogService dialogService)
        {
            this.dialogService = dialogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Dialog>>> GetDialogs([FromQuery] int offset, [FromQuery] int count)
        {
            var dialogs = await dialogService.GetDialogsAsync(HttpContext.GetUserId(), offset, count);
            return dialogs;
        }

        [HttpGet("{dialogId}")]
        public async Task<ActionResult<Dialog>> GetDialog(int dialogId)
        {
            if (dialogId > 0)
            {
                var dialog = await dialogService.GetDialogAsync(HttpContext.GetUserId(), dialogId);
                if (dialog != null)
                    return dialog;
            }

            var problemDetails = new ProblemDetails()
            {
                Detail = "Dialog doesn't exist"
            };
            return BadRequest(problemDetails);
        }

        [HttpGet]
        public async Task<ActionResult<Dialog>> GetDialogByInterlocutorId([FromQuery] int interlocutorId)
        {
            if (interlocutorId != HttpContext.GetUserId())
            {
                var dialog = await dialogService.GetDialogByInterlocutorIdAsync(HttpContext.GetUserId(), interlocutorId);
                if (dialog != null)
                    return dialog;
            }

            var problemDetails = new ProblemDetails()
            {
                Detail = "Dialog doesn't exist and can't be created"
            };
            return BadRequest(problemDetails);
        }
    }
}
