using Maelstorm.Database;
using Maelstorm.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using XApiTests.cs;

namespace XApiTests.Fakes
{
    public class FakeContext : MaelstormContext
    {        
        public FakeContext():base(new DbContextOptions<MaelstormContext>())
        {
            var accountService = new FakeServiceFactory(this).CreateAccountService();
            string[] nicknames = new string[]
            {
                "chep",
                "chepa"
            };
            foreach(var nickname in nicknames)
            {
                AddUser(accountService, nickname);
            }           
            SaveChanges();            
        }

        private void AddUser(IAccountService accountService, string nickname)
        {
            accountService.RegistrationAsync(new MaelstormDTO.Requests.RegistrationRequest()
            {
                Nickname = nickname,
                Email = $"{nickname}@gmail.com",
                Password = "1234567890",
                ConfirmPassword = "1234567890"
            }).Wait();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
        }
    }
}
