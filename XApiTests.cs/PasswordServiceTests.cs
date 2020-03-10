using Maelstorm.Services.Implementations;
using Maelstorm.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using Xunit;

namespace XApiTests.cs
{
    public class PasswordServiceTests
    {
        IPasswordService passServ;
        public PasswordServiceTests()
        {
            passServ = new PasswordService(new FakeConfig());            
        }

        #region HashTests
        [Fact]
        public void HashIsNotNull()
        {
            string hash = passServ.GenerateHash("123", "1abc32");
            Assert.NotNull(hash);
        }

        [Fact]
        public void HashesAreSame()
        {
            string hash1 = passServ.GenerateHash("123", "a13cb12");
            string hash2 = passServ.GenerateHash("123", "a13cb12");
            Assert.Equal(hash1, hash2);
        }

        [Fact]
        public void HashesAreNotEquals()
        {
            string hash1 = passServ.GenerateHash("123", "cucucuc");
            string hash2 = passServ.GenerateHash("123", "a13cb12");
            Assert.NotEqual(hash1, hash2);
        }
        #endregion

        #region TokenTests
        [Fact]
        public void TokenIsNotNull()
        {
            string token = passServ.GetRandomString();
            Assert.NotNull(token);
        }

        [Fact]
        public void TokensAreNotEquals()
        {
            string token1 = passServ.GetRandomString();
            string token2 = passServ.GetRandomString();
            Assert.NotEqual(token1, token2);
        }

        #endregion       
    }

}
