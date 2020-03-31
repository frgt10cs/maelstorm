using Maelstorm.Controllers;
using Maelstorm.Database;
using Maelstorm.Services.Implementations;
using Maelstorm.Services.Interfaces;
using Maelstorm.ViewModels;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace XApiTests.cs
{
    public class AccountServiceTests
    {
        IConfiguration config;
        IEmailService emailService;
        IPasswordService passServ;
        MaelstormRepository context;
        IAccountService accServ;

        public AccountServiceTests()
        {
            context = FakeContext.Context();            
            config = new FakeConfig();
            emailService = new EmailService();            
            passServ = new PasswordService(config);
            accServ = new AccountService(context, passServ, emailService, config, null);
        }

        [Fact]
        public void EmailIsNotUniq()
        {
           var result = accServ.RegistrationAsync(new RegistrationViewModel()
           {
               ConfirmPassword = "1234567890",
               Email = "123@mail.com",
               Nickname = "joker",
               Password = "1234567890"
           }).Result;
           Assert.Equal("Email is already exist", result.ErrorMessages[0]);
        }

        [Fact]        
        public void NicknameIsNotUniq()
        {
           var result = accServ.RegistrationAsync(new RegistrationViewModel()
           {
               ConfirmPassword = "1234567890",
               Email = "1233@mail.com",
               Nickname = "loshok",
               Password = "1234567890"
           }).Result;
           Assert.Equal("Nickname is already exist", result.ErrorMessages[0]);
        }
        
        [Fact]
        public void SuccesfulRegistration()
        {
           int userCount = context.Users.Count();
           int tokenCount = context.Tokens.Count();
           var result = accServ.RegistrationAsync(new RegistrationViewModel()
           {
               ConfirmPassword = "1234567890",
               Email = "1234@mail.com",
               Nickname = "losh0k",
               Password = "1234567890pop"
           }).Result;
           Assert.True(result.IsSuccessful);
           Assert.Empty(result.ErrorMessages);
           Assert.Equal(1, context.Users.Count() - userCount);
           Assert.Equal(1, context.Tokens.Count() - tokenCount);
        }
    }
}
