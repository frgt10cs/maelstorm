using Maelstorm.Crypto.Interfaces;
using Maelstorm.Models;
using Maelstorm.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<ServiceResult> AuthenticateAsync(AuthenticationViewModel model, string ip);
        Task<ServiceResult> RefreshToken(RefreshTokenViewModel model, string ip);
        TokensViewmodel CreateTokens(Claim[] claims);
        JwtValidationResult ValidateToken(string token, bool doesExpiredTokenThrowException = false);
    }
}
