using Xunit;

namespace XApiTests.cs
{    
    public class CryptographyServiceTests
    {        
        private FakeServiceFactory fakeServiceFactory;

        public CryptographyServiceTests()
        {
            fakeServiceFactory = new FakeServiceFactory();
        }        

        [Fact]
        public void GeneratesNotEmptyIV()
        {
            var cryptographyService = fakeServiceFactory.CreateCryptographyService();

            var iv = cryptographyService.GenerateIV();
            
            Assert.NotEmpty(iv);
        }

        [Fact]
        public void GeneratesRandomIVs()
        {
            var cryptographyService = fakeServiceFactory.CreateCryptographyService();

            var iv1 = cryptographyService.GenerateIV();
            var iv2 = cryptographyService.GenerateIV();

            Assert.NotEqual(iv1, iv2);
        }

        [Fact]
        public void GeneratesRandomBase64String()
        {
            var cryptographyService = fakeServiceFactory.CreateCryptographyService();

            var random1 = cryptographyService.GetRandomBase64String();
            var random2 = cryptographyService.GetRandomBase64String();

            Assert.NotEqual(random1, random2);
        }
    }
}
