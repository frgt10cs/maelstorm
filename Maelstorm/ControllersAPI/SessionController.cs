using Maelstorm.Dtos;
using Maelstorm.Extensions;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Maelstorm.ControllersAPI
{
 
    [Authorize]
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class SessionController:ControllerBase
    {
        private ISessionService sessionServ;
        private ISignalRSessionService signalSessionServ;
        public SessionController(ISessionService sessionServ, ISignalRSessionService signalSessionServ)
        {
            this.sessionServ = sessionServ;
            this.signalSessionServ = signalSessionServ;
        }

        [HttpPost]
        [ActionName("CloseCurrentSession")]
        public async Task CloseCurrentSession()
        {
            await sessionServ.CloseSessionAsync(HttpContext.GetUserId(), HttpContext.User.FindFirst("SessionId").Value);
        }

        [HttpPost]
        [ActionName("CloseSession")]
        public async Task CloseSession(CloseSessionDTO model)
        {
            await sessionServ.CloseSessionAsync(HttpContext.GetUserId(), model.SessionId, model.BanDevice);
        }        

        [HttpPost]
        [ActionName("GetOnlineStatuses")]
        public async Task<List<OnlineStatusDTO>> GetOnlineStatuses(int[] ids)
        {
            return await signalSessionServ.GetOnlineStatusesAsync(ids);
        }
        [HttpGet]
        [ActionName("GetSessions")]
        public async Task<ActionResult<List<SessionDTO>>> GetSessions()
        {
            return await sessionServ.GetSessionsAsync(HttpContext.GetUserId());
        }
    }
}
