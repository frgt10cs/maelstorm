using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Entities
{
    public class Token
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string Value { get; set; }
        public byte Action { get; set; }
        public DateTime GenerationDate { get; set; }
    }
}
