using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Entities
{
    public class RegisteredApp
    {
        public int Id { get; set; }        
        public string SecretKey { get; set; }
        public int UserId { get; set; }     
        public bool IsActive { get; set; }
    }
}
