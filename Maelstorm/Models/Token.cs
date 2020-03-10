using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Models
{
    public class Token
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Value { get; set; }
        public byte Action { get; set; }
        public DateTime GenerationDate { get; set; }
    }
}
