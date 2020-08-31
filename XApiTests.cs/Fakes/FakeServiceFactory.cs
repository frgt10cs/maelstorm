using Maelstorm.Crypto.Implementations;
using Maelstorm.Hubs;
using Maelstorm.Models;
using Maelstorm.Services.Implementations;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using StackExchange.Redis.Extensions.Core.Abstractions;
using XApiTests.Fakes;

namespace XApiTests.cs
{
    class FakeServiceFactory
    {
        private FakeContext context;        

        public FakeServiceFactory()
        {
            
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context">Shared DbContext</param>
        public FakeServiceFactory(FakeContext context)
        {
            this.context = context;
        }

        public IJwtService CreateJwtService()
        {
            var context = this.context ?? new FakeContext();
            var config = new FakeConfig();
            var jwtOptionsMock = new Mock<IOptions<JwtOptions>>();
            jwtOptionsMock.SetupGet(o => o.Value).Returns(new JwtOptions()
            {
                Audience = "mmm",
                EncryptingKey = new string('e', 256),
                SigningKey = new string('s', 256),
                ExpiryMinutes = 0,
                Issuer = "mmm"
            });
            var jwtOptions = jwtOptionsMock.Object;
            var jwtLogger = Mock.Of<ILogger<JwtService>>();

            var signingKey = new SigningSymmetricKey(new string('s', 256));
            var encryptionEncodingKey = new EncryptingSymmetricKey(new string('e', 256));

            var cryptographyService = new CryptographyService(config);

            var jwtService = new JwtService(context, jwtOptions, cryptographyService, signingKey, encryptionEncodingKey, jwtLogger);
            return jwtService;
        }

        public IOptions<JwtOptions> CreateJwtOptions()
        {
            var jwtOptionsMock = new Mock<IOptions<JwtOptions>>();
            jwtOptionsMock.SetupGet(o => o.Value).Returns(new JwtOptions()
            {
                Audience = "mmm",
                EncryptingKey = new string('e', 256),
                SigningKey = new string('s', 256),
                ExpiryMinutes = 0,
                Issuer = "mmm"
            });            
            return jwtOptionsMock.Object;
        }

        public ICryptographyService CreateCryptographyService()
        {
            var config = new FakeConfig();
            var cryptographyService = new CryptographyService(config);
            return cryptographyService;
        }

        public IAuthenticationService CreateAuthenticationService()
        {
            var context = this.context ?? new FakeContext();
            var authLogger = Mock.Of<ILogger<AuthenticationService>>();

            var cryptographyService = CreateCryptographyService();
            var jwtService = CreateJwtService();

            var authenticationService = new AuthenticationService(context, authLogger, jwtService, cryptographyService);

            return authenticationService;
        }

        public IAccountService CreateAccountService()
        {
            var context = this.context ?? new FakeContext();
            var emailService = Mock.Of<IEmailService>();
            var config = new FakeConfig();
            var cryptographyService = CreateCryptographyService();
            var accountService = new AccountService(context, emailService, config, cryptographyService);
            return accountService;
        }

        //public INotificationService CreateNotificationService()
        //{
        //    var notificatonService = new NotificationService()
        //}

        public IDialogService CreateDialogService()
        {
            var context = this.context ?? new FakeContext();
            var dialogLogger = Mock.Of<ILogger<DialogService>>();                                               
            var cryptographyService = CreateCryptographyService();            
            var notificationService = Mock.Of<INotificationService>();
            var dialogService = new DialogService(context, dialogLogger, cryptographyService, notificationService);
            return dialogService;
        }
    }
}
