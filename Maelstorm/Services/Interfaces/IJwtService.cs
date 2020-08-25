using Maelstorm.Dtos;
using Maelstorm.Models;
using MaelstormDTO.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IJwtService
    {
        JwtValidationResult ValidateToken(string token, bool getOnlyNotExpiredToken = false);
        TokensDTO CreateTokens(Claim[] claims);
        Task<ServiceResult> RefreshToken(RefreshTokenRequest model, string ip);
    }
}
