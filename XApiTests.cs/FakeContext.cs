using Maelstorm.Database;
using Maelstorm.Models;
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
            Users.Add(new User()
            {
                DateOfRegistration = DateTime.Now,
                Email = "123@mail.com",
                EmailIsConfirmed = true,
                Nickname = "loshok",
                PasswordHash = "ksksksksksks",
                Role = 0,
                Salt = "1234",
                Status = "zhopa"
            });
            SaveChanges();            
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
        }
    }
}
