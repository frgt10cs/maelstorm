using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class MessageDTO
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public int DialogId { get; set; }
        public DateTime DateOfSending { get; set; }
        public byte Status { get; set; }
        public string Text { get; set; }
    }
}
