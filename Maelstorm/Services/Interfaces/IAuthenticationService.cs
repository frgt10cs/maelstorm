using Maelstorm.Crypto.Interfaces;
using Maelstorm.Models;
using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<ServiceResult> AuthenticateAsync(AuthenticationDTO model, string ip);
        Task<ServiceResult> RefreshToken(RefreshTokenDTO model, string ip);
        TokensDTO CreateTokens(Claim[] claims);
        JwtValidationResult ValidateToken(string token, bool doesExpiredTokenThrowException = false);
    }
}
