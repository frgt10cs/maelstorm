using Maelstorm.Dtos;
using Maelstorm.Extensions;
using Maelstorm.Services.Interfaces;
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
    public class SessionController:ControllerBase
    {
        private readonly ISessionService sessionService;
        private readonly ISignalRSessionService signalRSessionService;
        public SessionController(ISessionService sessionService, ISignalRSessionService signalRSessionService)
        {
            this.sessionService = sessionService;
            this.signalRSessionService = signalRSessionService;
        }

        [HttpGet]
        [ActionName("sessions")]
        public async Task<List<SessionDTO>> GetSessions()
        {
            return await sessionService.GetSessionsAsync(HttpContext.GetUserId());
        }

        [HttpGet]
        [ActionName("sessions")]
        public async Task<SessionDTO> GetSessions(int sessionId)
        {
            return await sessionService.GetSessionAsync(HttpContext.GetUserId(), sessionId);
        }

        [HttpGet]
        [ActionName("statuses")]
        public async Task<List<OnlineStatusDTO>> GetOnlineStatuses(int[] ids)
        {
            return await signalRSessionService.GetOnlineStatusesAsync(ids);
        }

        [HttpPost]
        [ActionName("close")]
        public async Task CloseSessionAsync(CloseSessionDTO closeSessionDTO)
        {
            await sessionService.CloseSessionAsync(HttpContext.GetUserId(), closeSessionDTO.SessionId, closeSessionDTO.BanDevice);
        }
    }
}
