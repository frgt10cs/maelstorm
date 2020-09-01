using Maelstorm.Crypto.Interfaces;
using Maelstorm.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;

namespace Maelstorm.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<AuthenticationResult> AuthenticateAsync(AuthenticationRequest authenticationRequest, string ip);                
    }
}
