using Maelstorm.Models;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IJwtService
    {
        JwtValidationResult ValidateToken(string token, bool getOnlyNotExpiredToken = false);
        Tokens CreateTokens(Claim[] claims);
        Task<ServiceResult> RefreshTokenAsync(RefreshTokenRequest model, string ip);
    }
}
