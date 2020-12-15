using Maelstorm.Database;
using Maelstorm.Models;
using Maelstorm.Entities;
using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Maelstorm.Services.Implementations
{
    public class AccountService:IAccountService
    {
        private MaelstormContext context;        
        private IEmailService emailServ;
        private ICryptographyService cryptoService;
        private readonly IConfiguration config;        

        public AccountService(MaelstormContext context, IEmailService emailServ,
            IConfiguration config, ICryptographyService cryptoService)
        {
            this.context = context;            
            this.emailServ = emailServ;
            this.config = config;
            this.cryptoService = cryptoService;
        }

        public async Task<ServiceResult> RegistrationAsync(RegistrationRequest registrationRequest)
        {
            var result = new ServiceResult();
            if (await EmailIsUnique(registrationRequest.Email))
            {
                if(await NicknameIsUnique(registrationRequest.Nickname))
                {                    
                    User user = CreateUser(registrationRequest);
                    context.Users.Add(user);
                    await context.SaveChangesAsync();
                    Token token = CreateToken(user.Id, 0);
                    context.Tokens.Add(token);
                    await context.SaveChangesAsync();
                    emailServ.SendMessageAsync(user.Email,                        
                        "Thank you for registration."+
                        $"Click <a href=\"https://{config["AppURL"]}/Account/ConfirmEmail?token={token.Value}\">here</a> "+
                        "to confirm email"
                        ,"Confirm email");
                }
                else
                {
                    result.ProblemDetails.Extensions.Add("Nickname", "Nickname is already used");
                }
            }
            else
            {
                result.ProblemDetails.Extensions.Add("Email", "Email is already registered");
            }
            return result;
        }

        public async Task<ServiceResult> ConfirmEmailAsync(string confirmEmailTokentoken)
        {
            var result = new ServiceResult();       
            var token = await context.Tokens.FirstOrDefaultAsync(t => t.Value == confirmEmailTokentoken);
            if (token != null)
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Id == token.UserId);
                if (user != null)
                {
                    user.EmailIsConfirmed = true;
                    context.Tokens.Remove(token);
                    await context.SaveChangesAsync();                    
                }
                else
                {
                    result.ProblemDetails.Extensions.Add(string.Empty, "Invalid token");
                }
            }
            else
            {
                result.ProblemDetails.Extensions.Add(string.Empty ,"Invalid token");
            }
            return result;
        }

        private async Task<bool> EmailIsUnique(string email)
        {
            User user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user == null;
        }

        private async Task<bool> NicknameIsUnique(string nickname)
        {
            User user = await context.Users.FirstOrDefaultAsync(u => u.Nickname == nickname);
            return user == null;
        }               
        
        private User CreateUser(RegistrationRequest model)
        {
            using var rsa = RSA.Create(2048);            
            User user = new User()
            {
                DateOfRegistration = DateTime.Now,
                Email = model.Email,
                Nickname = model.Nickname,             
                Role = 0,
                Status = "Stupid status from community",
                Image = "defaultUser.png",
                PublicKey = Convert.ToBase64String(rsa.ExportSubjectPublicKeyInfo())                
            };
            #region password generation
            var passwordSalt = cryptoService.GetRandomBytes();
            user.PasswordSalt = Convert.ToBase64String(passwordSalt);
            user.PasswordHash = Convert.ToBase64String(cryptoService.Pbkdf2(model.Password, passwordSalt));
            #endregion

            #region keys generation
            var keySalt = cryptoService.GetRandomBytes();
            user.KeySalt = Convert.ToBase64String(keySalt);
            var iv = cryptoService.GenerateIV();                        
            user.IVBase64 = Convert.ToBase64String(iv);            
            // key with 256-bites length
            var userAesKey = cryptoService.Pbkdf2(model.Password, keySalt, 32);
            user.EncryptedPrivateKey = Convert.ToBase64String(cryptoService.AesEncryptBytes(rsa.ExportPkcs8PrivateKey(), userAesKey, iv, 256));            
            #endregion

            return user;
        }

        private Token CreateToken(long userId, byte action)
        {
            Token token = new Token()
            {
                Action = action,
                GenerationDate = DateTime.Now,
                UserId = userId,
                Value = cryptoService.GetRandomBase64String()
            };
            return token;
        }       
    }    
}