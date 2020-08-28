using Maelstorm.Database;
using Maelstorm.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace XApiTests.Fakes
{
    public class FakeContext : MaelstormContext
    {        
        public FakeContext():base(new DbContextOptions<MaelstormContext>())
        {
            string[] nicknames = new string[]
            {
                "chep",
                "chepa"
            };

            #region Adding users
            foreach (string nickname in nicknames)
            {
                Users.Add(new User()
                {
                    DateOfRegistration = DateTime.Now,
                    Email = $"{nickname}@gmail.com",
                    EmailIsConfirmed = true,
                    Nickname = nickname,
                    PasswordHash = "ksksksksksks",
                    Role = 0,
                    PasswordSalt = "1234",
                    Status = "hi!"
                });
            }            
            SaveChanges();
            #endregion
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
        }
    }
}
