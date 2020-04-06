using Maelstorm.Entities;
using Maelstorm.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Database
{
    public class MaelstormContext : DbContext
    {
        public DbSet<User> Users { get; protected set; }
        public DbSet<DialogMessage> DialogMessages { get; protected set; }
        public DbSet<Dialog> Dialogs { get; protected set; }
        public DbSet<Token> Tokens { get; protected set; }
        public DbSet<RegisteredApp> Apps { get; protected set; }
        public DbSet<Session> Sessions { get; protected set; }
        public DbSet<BannedDevice> BannedDevices { get; protected set; }

        public MaelstormContext(DbContextOptions<MaelstormContext> options):base(options)
        {
            Database.EnsureCreated();            
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {                        
            //optionsBuilder.UseSqlite("Filename = Maelstorm.db");
        }
    }
}
