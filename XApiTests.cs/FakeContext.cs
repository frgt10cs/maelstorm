using Maelstorm.Database;
using Maelstorm.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace XApiTests.cs
{
    class FakeContext : MaelstormContext
    {
        private static readonly FakeContext db = new FakeContext();
        public static FakeContext Context() => db;
        private FakeContext():base(null)
        {
            string[] nicknames = new string[]
            {
                "chep",
                "chepa"
            };

            foreach(string nickname in nicknames)
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
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
        }
    }
}
