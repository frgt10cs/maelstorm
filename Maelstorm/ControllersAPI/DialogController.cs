using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Extensions;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Maelstorm.ControllersAPI
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]/[action]")]
    public class DialogController : ControllerBase
    {
        private IDialogService dialServ;
        public DialogController(IDialogService dialServ)
        {
            this.dialServ = dialServ;
        }               

        [HttpGet]
        [ActionName("GetUnreadedDialogMessages")]
        public async Task<ActionResult<List<MessageViewModel>>> GetUnreadedDialogMessages(int dialogId, int count)
        {
            return await dialServ.GetUnreadedDialogMessagesAsync(dialogId, count);            
        }

        [HttpGet]
        [ActionName("GetReadedDialogMessages")]
        public async Task<ActionResult<List<MessageViewModel>>> GetReadedDialogMessages(int dialogId, int offset, int count)
        {                        
            return await dialServ.GetReadedDialogMessagesAsync(dialogId, offset, count);            
        }        

        [NonAction]
        private int[] ToInts(string[] queries)
        {
            int[] result = new int[queries.Length];
            for(int i = 0; i < queries.Length; i++)
            {
                if (!Int32.TryParse(queries[i], out int tmp))
                {
                    return null;
                }
                result[i] = tmp;
            }
            return result;
        }        

        [HttpPost]
        [ActionName("SendMessage")]
        public async Task<ActionResult<ServiceResult>> SendDialogMessage([FromBody]MessageSendViewModel model)
        {
            // сделать проверку replyid
            ServiceResult result;            
            if (ModelState.IsValid)
            {                
                result = await dialServ.SendDialogMessageAsync(model);
            }
            else
            {
                result = new ServiceResult(ModelState);
            }
            return result;
        }

        [ActionName("GetDialogs")]
        public async Task<ActionResult<List<DialogViewModel>>> GetDialogs(int offset, int count)
        {            
            var dialogs = await dialServ.GetDialogsAsync(offset, count);
            return dialogs;
        }

        [HttpPost]
        [ActionName("Readed")]
        public async Task SetMessageAsReaded([FromBody]int messageId)
        {
            await dialServ.SetMessageAsReaded(messageId);
        }

        [ActionName("GetDialog")]
        public async Task<ActionResult<DialogViewModel>> GetDialog(int interlocutorId)
        {
            return await dialServ.GetDialogAsync(interlocutorId);
        }
    }
}