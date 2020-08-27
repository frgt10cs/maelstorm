using Maelstorm.Database;
using Maelstorm.Models;
using Maelstorm.Services.Implementations;
using Maelstorm.Crypto.Implementations;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Xunit;

namespace XApiTests.cs
{
    public class JwtOpt : IOptions<JwtOptions>
    {
        JwtOptions IOptions<JwtOptions>.Value => new JwtOptions()
        {
            Audience = "mmm",
            Issuer = "mmm",
            EncryptingKey = new String('e', 40),
            SigningKey = new String('s', 40),
            ExpiryMinutes = 1
        };       
    }

    //public class AuthenticationServiceTest
    //{
    //    MaelstormContext context;
    //    AuthenticationService serv;
    //    CryptographyService cryptographyService;

    //    public AuthenticationServiceTest()
    //    {
    //        cryptographyService = new CryptographyService(new FakeConfig());
    //        context = FakeContext.Context();
    //        serv = new AuthenticationService(context, null, new JwtService(context, new JwtOpt(), cryptographyService), cryptographyService);

    //    }

    //    [Fact]
    //    public void TokensAreNotSame()
    //    {
    //        Claim[] claims = new Claim[]
    //        {
    //            new Claim("123","456"),
    //            new Claim("789","1010")
    //        };
    //        string token1 = serv.CreateToken(claims);
    //        string token2 = serv.CreateToken(claims);
    //        Assert.NotEqual(token1, token2);
    //    }
    //}
}
