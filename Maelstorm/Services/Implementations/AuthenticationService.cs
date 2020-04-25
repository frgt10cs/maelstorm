using Maelstorm.Crypto.Interfaces;
using Maelstorm.Database;
using Maelstorm.Models;
using Maelstorm.Entities;
using Maelstorm.Services.Interfaces;
using Maelstorm.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net;
using System.Text.RegularExpressions;

namespace Maelstorm.Services.Implementations
{
    public class AuthenticationService : IAuthenticationService
    {
        private MaelstormContext context;
        private IOptions<JwtOptions> jwtOptions;
        private ISigningKeys signingKeys;
        private IEncryptingKeys encryptingKeys;        
        private ILogger<AccountService> logger;
        private ICryptographyService cryptoServ;

        public AuthenticationService(MaelstormContext context, IOptions<JwtOptions> jwtOptions, ICryptographyService cryptoServ,
            ISigningKeys signingKeys, IEncryptingKeys encryptingKeys, ILogger<AccountService> logger)
        {            
            this.context = context;
            this.jwtOptions = jwtOptions;
            this.signingKeys = signingKeys;
            this.cryptoServ = cryptoServ;
            this.encryptingKeys = encryptingKeys;            
            this.logger = logger;
        }

        public async Task<ServiceResult> AuthenticateAsync(AuthenticationDTO model, string ip)
        {
            ServiceResult result = new ServiceResult();
            User user = await LoginAsync(model);
            if (user != null)
            {
                BannedDevice device = await context.BannedDevices.FirstOrDefaultAsync(d => d.UserId == user.Id && d.Fingerprint == model.Fingerprint);
                if (device == null)
                {
                    Session session = await context.Sessions.FirstOrDefaultAsync(s => s.UserId == user.Id && s.FingerPrint == model.Fingerprint);
                    if (session == null)
                    {
                        session = new Session()
                        {
                            UserId = user.Id,
                            SessionId = cryptoServ.GetRandomString(),
                            FingerPrint = model.Fingerprint,
                            CreatedAt = DateTime.Now,
                            App = model.App,
                            OsCpu = model.OsCpu,
                            // ExpiresInDays = 30,
                            Location = GetLocationByIp(ip)
                        };
                        context.Sessions.Add(session);
                    }
                    TokensDTO tokens = CreateTokens(new Claim[]
                    {
                        new Claim("UserId", user.Id.ToString()),
                        new Claim("UserEmail", user.Email),
                        new Claim("Fingerprint", model.Fingerprint),
                        new Claim("Ip", ip),
                        new Claim("SessionId", session.SessionId)
                    });
                    session.IpAddress = ip;
                    session.RefreshToken = tokens.RefreshToken;
                    await context.SaveChangesAsync();
                    var authResult = new AuthenticationResultDTO() { IVBase64 = user.IVBase64, EncryptedPrivateKey = user.EncryptedPrivateKey, Tokens = tokens };
                    result.Data = JsonConvert.SerializeObject(authResult);
                }
                else
                {
                    result.SetFail("Access is blocked");
                }
            }
            else
            {
                result.SetFail("Authentication failed");
            }
            return result;
        }

        public async Task<User> LoginAsync(AuthenticationDTO model)
        {
            User result = null;
            var user = await context.Users.FirstOrDefaultAsync(u => u.Nickname == model.Login);
            if (user != null)
            {
                string hash = cryptoServ.GeneratePasswordHash(model.Password, user.Salt);
                if (hash == user.PasswordHash)
                {
                    result = user;
                }
                else
                {
                    logger.LogWarning("Login failed. Incorrect password. UserId: " + user.Id);
                }
            }
            else
            {
                logger.LogWarning("Login failed. Incorrect email. Login: " + model.Login);
            }
            return result;
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
                    result.Data = JsonConvert.SerializeObject(tokens);
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
                RefreshToken = cryptoServ.GetRandomString(),
                GenerationTime = generationTime
            };
            return model;
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

        public string GetLocationByIp(string ip)
        {
            string location = "Unlocated";
            Regex ipRegex = new Regex(@"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b");
            MatchCollection result = ipRegex.Matches(ip);
            if (result.Any())
            {
                if (ip.StartsWith("10.") || ip.StartsWith("100.") || ip.StartsWith("127.") || ip.StartsWith("172.") || ip.StartsWith("192."))
                {
                    return "Local address";
                }
                IpInfo ipInfo = new IpInfo();
                try
                {
                    string info = new WebClient().DownloadString("http://ipinfo.io/" + ip);
                    ipInfo = JsonConvert.DeserializeObject<IpInfo>(info);
                    location = ipInfo.City + ", " + ipInfo.Country + ", " + ipInfo.Region;
                }
                catch (Exception)
                {
                    ipInfo.Country = null;
                }
            }
            return location;
        }       
    }
}
