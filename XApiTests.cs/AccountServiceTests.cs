using MaelstormDTO.Requests;
using XApiTests.Fakes;
using Xunit;
using MaelstormDTO.Responses;
using System.Linq;

namespace XApiTests.cs
{
    [CollectionDefinition("Fake context")]
    public class FakeContextCollectionDefinition : ICollectionFixture<FakeContext> { }

    [Collection("Fake context")]
    public class AccountServiceTests
    {        
        private FakeServiceFactory fakeServiceFactory;
        public AccountServiceTests(FakeContext context)
        {            
            fakeServiceFactory = new FakeServiceFactory(context);
        }        

        [Fact]
        public void EmailIsNotUniq()
        {
            var accountService = fakeServiceFactory.CreateAccountService();            

            var result = accountService.RegistrationAsync(new RegistrationRequest()
            {                
                Email = "chep@gmail.com",
                Nickname = "joker",
                Password = "1234567890",
                ConfirmPassword = "1234567890",
            }).Result;
            
            Assert.NotNull(result.ProblemDetails.Extensions["Email"]);            
        }

        [Fact]
        public void NicknameIsNotUniq()
        {
            var accountService = fakeServiceFactory.CreateAccountService();

            var result = accountService.RegistrationAsync(new RegistrationRequest()
            {
                ConfirmPassword = "1234567890",
                Email = "1233@mail.com",
                Nickname = "chepa",
                Password = "1234567890"
            }).Result;           

            Assert.NotNull(result.ProblemDetails.Extensions["Nickname"]);           
        }

        [Fact]
        public void SuccesfulRegistration()
        {
            var accountService = fakeServiceFactory.CreateAccountService();

            var result = accountService.RegistrationAsync(new RegistrationRequest()
            {
                ConfirmPassword = "1234567890",
                Email = "1234@mail.com",
                Nickname = "turtle",
                Password = "1234567890"
            }).Result;

            var result2 = accountService.RegistrationAsync(new RegistrationRequest()
            {
                ConfirmPassword = "1234567890",
                Email = "5678@mail.com",
                Nickname = "turtle2",
                Password = "1234567890"
            }).Result;

            Assert.True(result.Ok);
            Assert.True(result2.Ok);            
        }
    }
}
