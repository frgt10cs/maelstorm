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
            Audience = "hui",
            Issuer = "huier",
            EncryptingKey = new String('e', 40),
            SigningKey = new String('s', 40),
            ExpiryMinutes = 1
        };       
    }

    //public class AuthenticationServiceTest
    //{
    //    MaelstormContext context;
    //    AuthenticationService serv;

    //    public AuthenticationServiceTest()
    //    {
    //        context = new FakeContext().CreateContext();
    //        serv = new AuthenticationService(context, new PasswordService(new FakeConfig()), new JwtOpt(),
    //            new SigningSymmetricKey(new String('s', 100)), new EncryptingSymmetricKey(new String('e', 100)));

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
