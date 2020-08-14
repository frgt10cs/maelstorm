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
        private readonly IJwtService jwtService;
        public SessionsController(ISessionService sessionService, ISignalRSessionService signalRSessionService, IJwtService jwtService)
        {
            this.sessionService = sessionService;
            this.signalRSessionService = signalRSessionService;
            this.jwtService = jwtService;
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

        [HttpPost("refresh")]
        public async Task<ServiceResult> RefreshToken([FromBody]RefreshTokenDTO model)
        {
            ServiceResult result = ModelState.IsValid? await jwtService.RefreshToken(model, HttpContext.Connection.RemoteIpAddress.ToString())
                : new ServiceResult(ModelState);            
            return result;
        }
    }
}
