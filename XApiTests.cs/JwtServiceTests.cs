using Maelstorm.Crypto.Implementations;
using Maelstorm.Entities;
using Maelstorm.Models;
using Maelstorm.Services.Implementations;
using Maelstorm.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;
using XApiTests.Fakes;
using Xunit;

namespace XApiTests.cs
{       
    public class JwtServiceTests
    {
        private FakeServiceFactory fakeServiceFactory;
        public JwtServiceTests()
        {
            fakeServiceFactory = new FakeServiceFactory();
        }

        [Fact]
        public void GeneratesNotEmptyTokensTokens()
        {
            var jwtService = fakeServiceFactory.CreateJwtService();
            var claims = new Claim[]
            {
                new Claim("UserId","1"),
                new Claim("UserEmail","chep@gmail.com"),
                new Claim("Fingerprint","abc"),
                new Claim("SessionId","wjKWa")
            };

            var tokens = jwtService.CreateTokens(claims);

            Assert.NotNull(tokens);
            Assert.NotEmpty(tokens.AccessToken);
            Assert.NotEmpty(tokens.RefreshToken);
            Assert.NotEqual(DateTime.MinValue, tokens.GenerationTime);
        }
    }
}
