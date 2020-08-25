using Maelstorm.Dtos;
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
    public class SessionsController:ControllerBase
    {
        private readonly ISessionService sessionService;
        private readonly ISignalRSessionService signalRSessionService;
        
        public SessionsController(ISessionService sessionService, ISignalRSessionService signalRSessionService)
        {
            this.sessionService = sessionService;
            this.signalRSessionService = signalRSessionService;            
        }

        [HttpGet]       
        public async Task<List<SessionDTO>> GetSessions(int offset, int count)
        {
            return await sessionService.GetSessionsAsync(HttpContext.GetUserId(), offset, count);
        }

        [HttpGet("{sessionId}")]        
        public async Task<SessionDTO> GetSessions(string sessionId)
        {
            return await sessionService.GetSessionAsync(HttpContext.GetUserId(), sessionId);
        }

        [HttpGet("online-statuses/{ids}")]     
        public async Task<List<OnlineStatusDTO>> GetOnlineStatuses(int[] ids)
        {
            return await signalRSessionService.GetOnlineStatusesAsync(ids);
        }

        [HttpPost("close")]        
        public async Task CloseSessionAsync([FromBody]CloseSessionDTO closeSessionDTO)
        {
            await sessionService.CloseSessionAsync(HttpContext.GetUserId(), closeSessionDTO.SessionId, closeSessionDTO.BanDevice);
        }
    }
}
