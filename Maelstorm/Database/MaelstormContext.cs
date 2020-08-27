using Maelstorm.Entities;
using Microsoft.EntityFrameworkCore;

namespace Maelstorm.Database
{
    public class MaelstormContext : DbContext
    {
        public DbSet<User> Users { get; protected set; }
        public DbSet<Message> DialogMessages { get; protected set; }
        public DbSet<Dialog> Dialogs { get; protected set; }
        public DbSet<Token> Tokens { get; protected set; }        
        public DbSet<MaelstormDTO.Responses.Session> Sessions { get; protected set; }
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
