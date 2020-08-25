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
using System.Text;
using MaelstormDTO.Requests;
using Microsoft.AspNetCore.Mvc;

namespace Maelstorm.Services.Implementations
{
    public class AuthenticationService : IAuthenticationService
    {
        private MaelstormContext context;       
        private ILogger<AccountService> logger;
        private ICryptographyService cryptoService;
        private IJwtService jwtService;

        public AuthenticationService(MaelstormContext context, ILogger<AccountService> logger, IJwtService jwtService, ICryptographyService cryptoService)
        {            
            this.context = context;                      
            this.logger = logger;
            this.jwtService = jwtService;
            this.cryptoService = cryptoService;
        }

        public async Task<ServiceResult> AuthenticateAsync([FromBody]AuthenticationRequest authenticationRequest, string ip)
        {
            ServiceResult result = new ServiceResult();
            User user = await LoginAsync(authenticationRequest);
            if (user != null)
            {
                BannedDevice device = await context.BannedDevices.FirstOrDefaultAsync(d => d.UserId == user.Id && d.Fingerprint == authenticationRequest.Fingerprint);
                if (device == null)
                {
                    Session session = await context.Sessions.FirstOrDefaultAsync(s => s.UserId == user.Id && s.FingerPrint == authenticationRequest.Fingerprint);
                    if (session == null)
                    {
                        session = new Session()
                        {
                            UserId = user.Id,
                            SessionId = cryptoService.GetRandomBase64String(),
                            FingerPrint = authenticationRequest.Fingerprint,
                            CreatedAt = DateTime.Now,
                            App = authenticationRequest.App,
                            OsCpu = authenticationRequest.Os,
                            // ExpiresInDays = 30,                            
                        };
                        context.Sessions.Add(session);
                    }
                    TokensDTO tokens = jwtService.CreateTokens(new Claim[]
                    {
                        new Claim("UserId", user.Id.ToString()),
                        new Claim("UserEmail", user.Email),
                        new Claim("Fingerprint", authenticationRequest.Fingerprint),
                        new Claim("Ip", ip),
                        new Claim("SessionId", session.SessionId)
                    });
                    session.IpAddress = ip;
                    session.Location = GetLocationByIp(ip);
                    session.RefreshToken = tokens.RefreshToken;                    
                    await context.SaveChangesAsync();
                    var authResult = new AuthenticationResultDTO() 
                    {
                        IVBase64 = user.IVBase64,
                        KeySaltBase64 = user.KeySalt,
                        PublicKey = user.PublicKey,
                        EncryptedPrivateKey = user.EncryptedPrivateKey,
                        Tokens = tokens 
                    };                    
                    result.Data = authResult;
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

        private async Task<User> LoginAsync(AuthenticationRequest authenticationRequest)
        {
            User result = null;
            var user = await context.Users.FirstOrDefaultAsync(u => u.Nickname == authenticationRequest.Login);
            if (user != null)
            {
                string hash = Convert.ToBase64String(cryptoService.Pbkdf2(authenticationRequest.Password, Convert.FromBase64String(user.PasswordSalt)));
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
                logger.LogWarning("Login failed. Incorrect email. Login: " + authenticationRequest.Login);
            }
            return result;
        }         

        private string GetLocationByIp(string ip)
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
