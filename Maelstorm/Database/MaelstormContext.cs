using Maelstorm.Models;
using Maelstorm.ViewModels;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Database
{
    public class MaelstormContext : MaelstormRepository
    {        
        public MaelstormContext()
        {
            Database.EnsureCreated();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Filename = Maelstorm.db");
        }
    }
}
