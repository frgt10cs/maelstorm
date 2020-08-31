using Maelstorm.Crypto.Interfaces;
using Maelstorm.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MaelstormDTO.Requests;

namespace Maelstorm.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<ServiceResult> AuthenticateAsync(AuthenticationRequest authenticationRequest, string ip);                
    }
}
