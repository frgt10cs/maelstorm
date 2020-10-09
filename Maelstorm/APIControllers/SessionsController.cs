using Maelstorm.Extensions;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
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
        public async Task<IEnumerable<UserSessions>> GetSessions([FromQuery]int offset, [FromQuery]int count)
        {
            return await sessionService.GetSessionsAsync(HttpContext.GetUserId(), offset, count);
        }

        [HttpGet("{sessionId}")]        
        public async Task<UserSessions> GetSession(string sessionId)
        {
            return await sessionService.GetSessionAsync(HttpContext.GetUserId(), sessionId);
        }

        [HttpGet("online-statuses/{ids}")]     
        public async Task<IEnumerable<OnlineStatus>> GetOnlineStatuses(int[] ids)
        {
            return await signalRSessionService.GetOnlineStatusesAsync(ids);
        }

        [HttpDelete]        
        public void CloseSessionAsync([FromBody]CloseSessionRequest closeSessionDTO)
        {
            sessionService.CloseSessionAsync(HttpContext.GetUserId(), closeSessionDTO.SessionId, closeSessionDTO.BanDevice);
        }

        [HttpDelete("current")]
        public void CloseCurrentSession()
        {
            sessionService.CloseSessionAsync(HttpContext.GetUserId(),
                HttpContext.GetSessionId());
        }
    }
}
