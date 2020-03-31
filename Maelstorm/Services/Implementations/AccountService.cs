using Maelstorm.Database;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class AccountService:IAccountService
    {
        private MaelstormRepository context;
        private IPasswordService passServ;
        private IEmailService emailServ;
        private ICryptographyService cryptoService;
        private readonly IConfiguration config;        

        public AccountService(MaelstormRepository context, IPasswordService passServ,
            IEmailService emailServ, IConfiguration config, ICryptographyService cryptoService)
        {
            this.context = context;
            this.passServ = passServ;
            this.emailServ = emailServ;
            this.config = config;
            this.cryptoService = cryptoService;
        }

        public async Task<ServiceResult> RegistrationAsync(RegistrationViewModel model)
        {            
            var result = new ServiceResult();           
            if (await EmailIsUnique(model.Email))
            {
                if(await NicknameIsUnique(model.Nickname))
                {                    
                    User user = CreateUser(model);
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
                    result.SetFail("Nickname is already exist");
                }
            }
            else
            {
                result.SetFail("Email is already exist");
            }
            return result;
        }

        public async Task<ServiceResult> ConfirmEmailAsync(string token)
        {
            var result = new ServiceResult();
            result.SetFail();
            var token_ = await context.Tokens.FirstOrDefaultAsync(t => t.Value == token);
            if (token_ != null)
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Id == token_.UserId);
                if (user != null)
                {
                    user.EmailIsConfirmed = true;
                    context.Tokens.Remove(token_);
                    await context.SaveChangesAsync();
                    result.SetSuccess();
                }
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
        
        private User CreateUser(RegistrationViewModel model)
        {
            using var rsa = RSA.Create(2048);
            User user = new User()
            {
                DateOfRegistration = DateTime.Now,
                Email = model.Email,
                Nickname = model.Nickname,
                Salt = passServ.GetRandomString(),
                Role = 0,
                Status = "Stupid status from community",
                Image = "defaultUser.png",
                PublicKey = Convert.ToBase64String(rsa.ExportRSAPublicKey()),
                EncryptedPrivateKey = Convert.ToBase64String(cryptoService.AesEncryptBytes(rsa.ExportRSAPrivateKey(), model.Password, new byte[16]))
            };
            user.PasswordHash = passServ.GenerateHash(model.Password, user.Salt);
            return user;
        }

        private Token CreateToken(int userId, byte action)
        {
            Token token = new Token()
            {
                Action = action,
                GenerationDate = DateTime.Now,
                UserId = userId,
                Value = passServ.GetRandomString()
            };
            return token;
        }       
    }    
}