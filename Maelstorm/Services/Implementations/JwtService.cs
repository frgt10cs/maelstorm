using Maelstorm.Crypto.Interfaces;
using Maelstorm.Database;
using Maelstorm.Dtos;
using Maelstorm.Entities;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class JwtService : IJwtService
    {
        private readonly MaelstormContext context;
        private IOptions<JwtOptions> jwtOptions;
        private ISigningKeys signingKeys;
        private IEncryptingKeys encryptingKeys;
        private ICryptographyService cryptoServ;
        private ILogger<AccountService> logger;

        public JwtService(MaelstormContext context, IOptions<JwtOptions> jwtOptions, ICryptographyService cryptoServ,
            ISigningKeys signingKeys, IEncryptingKeys encryptingKeys, ILogger<AccountService> logger)
        {
            this.context = context;
            this.jwtOptions = jwtOptions;
            this.signingKeys = signingKeys;
            this.cryptoServ = cryptoServ;
            this.encryptingKeys = encryptingKeys;
            this.logger = logger;
        }

        public TokensDTO CreateTokens(Claim[] claims)
        {
            DateTime generationTime = DateTime.Now;
            var tokenHandler = new JwtSecurityTokenHandler();
            JwtSecurityToken token = tokenHandler.CreateJwtSecurityToken(
                issuer: jwtOptions.Value.Issuer,
                audience: jwtOptions.Value.Audience,
                subject: new ClaimsIdentity(claims),
                notBefore: generationTime,
                expires: DateTime.Now.AddMinutes(jwtOptions.Value.ExpiryMinutes),
                issuedAt: generationTime,
                signingCredentials: new SigningCredentials(
                    ((IJwtSigningDecodingKey)signingKeys).GetKey(),
                    signingKeys.SigningAlgorithm),
                encryptingCredentials: new EncryptingCredentials(
                    ((IJwtEncryptingEncodingKey)encryptingKeys).GetKey(),
                    encryptingKeys.SigningAlgorithm,
                    encryptingKeys.EncryptingAlgorithm)
            );
            TokensDTO model = new TokensDTO()
            {
                AccessToken = tokenHandler.WriteToken(token),
                RefreshToken = cryptoServ.GetRandomBase64String(),
                GenerationTime = generationTime
            };
            return model;
        }

        public async Task<ServiceResult> RefreshToken(RefreshTokenDTO model, string ip)
        {
            ServiceResult result = new ServiceResult();
            JwtValidationResult validationResult = ValidateToken(model.Token);
            if (validationResult.IsSuccessful && validationResult.IsTokenExpired)
            {
                Session session = await context.Sessions.FirstOrDefaultAsync(s => s.RefreshToken == model.RefreshToken && s.FingerPrint == model.Fingerprint);
                if (session != null)
                {
                    var tokens = CreateTokens(new Claim[]
                    {
                        validationResult.Principial.FindFirst("UserId"),
                        validationResult.Principial.FindFirst("UserEmail"),
                        validationResult.Principial.FindFirst("Fingerprint"),
                        validationResult.Principial.FindFirst("SessionId"),
                        new Claim("Ip", ip)
                    });
                    session.IpAddress = ip;
                    session.RefreshToken = tokens.RefreshToken;
                    await context.SaveChangesAsync();
                    result.WriteData(tokens);
                    return result;
                }
                else
                {
                    result.SetFail("Invalid refresh token");
                    logger.LogWarning("Token wasn't refresh. Invalid session");
                }
            }
            else
            {
                result.SetFail("Invalid token");
                logger.LogWarning("Token wasn't refresh. Invalid value or token is not expired: " + model.Token);
            }
            return result;
        }

        public JwtValidationResult ValidateToken(string token, bool getOnlyNotExpiredToken = false)
        {
            JwtValidationResult result = new JwtValidationResult();
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = getOnlyNotExpiredToken,
                IssuerSigningKey = ((IJwtSigningDecodingKey)signingKeys).GetKey(),
                TokenDecryptionKey = ((IJwtEncryptingDecodingKey)encryptingKeys).GetKey(),
                ValidAudience = jwtOptions.Value.Audience,
                ValidIssuer = jwtOptions.Value.Issuer
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
                JwtSecurityToken jwtSecurityToken = securityToken as JwtSecurityToken;
                if (jwtSecurityToken != null &&
                    jwtSecurityToken.Header.Alg.Equals(encryptingKeys.SigningAlgorithm, StringComparison.InvariantCultureIgnoreCase))
                {
                    if (jwtSecurityToken.ValidTo < DateTime.Now)
                    {
                        result.IsTokenExpired = true;
                    }
                    result.SetSuccess(principal);
                }
                else
                {
                    result.SetFail(new SecurityTokenInvalidSigningKeyException());
                }
            }
            catch (Exception ex)
            {
                result.SetFail(ex);
            }
            return result;
        }
    }
}
