using Maelstorm.Crypto.Implementations;
using Maelstorm.Database;
using Maelstorm.Entities;
using Maelstorm.Models;
using Maelstorm.Services.Implementations;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using XApiTests.Fakes;
using Xunit;
using Xunit.Priority;

namespace XApiTests.cs
{    
    [Collection("Fake context")]
    [TestCaseOrderer(PriorityOrderer.Name, PriorityOrderer.Assembly)]
    public class AuthenticationServiceTests:IClassFixture<Tokens>
    {                
        private Tokens tokens;
        private FakeServiceFactory fakeServiceFactory;
        public AuthenticationServiceTests(FakeContext context, Tokens tokens)
        {           
            this.tokens = tokens;
            fakeServiceFactory = new FakeServiceFactory(context);
        }

        [Fact, Priority(1)]
        public void SuccessfulAuthentication()
        {
            var authenticationService = fakeServiceFactory.CreateAuthenticationService();
            var authenticationRequest = new AuthenticationRequest()
            {
                App = ".net",
                Os = "Windows",
                Login = "turtle",
                Password = "1234567890",
                Fingerprint = "abc",
            };

            var authResult = authenticationService.AuthenticateAsync(authenticationRequest, string.Empty).Result;            
            tokens.AccessToken = authResult?.Tokens?.AccessToken;
            tokens.RefreshToken = authResult?.Tokens?.RefreshToken;

            Assert.NotNull(authResult);
        }

        [Fact, Priority(10)]
        public void SuccessfulRefreshToken()
        {
            var jwtService = fakeServiceFactory.CreateJwtService();
            var refreshTokenRequest = new RefreshTokenRequest()
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                Fingerprint = "abc"
            };

            var newTokens = jwtService.RefreshTokenAsync(refreshTokenRequest, "127.0.0.1").Result;
            tokens = newTokens;

            Assert.NotNull(newTokens);
        }
    }
}
