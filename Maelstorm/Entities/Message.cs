using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Entities
{
    public class Message
    {
        public long Id { get; set; }        
        public long AuthorId { get; set; }
        public User Author { get; set; }        
        public long DialogId { get; set; }
        public Dialog Dialog { get; set; }
        public DateTime DateOfSending { get; set; }
        public bool IsReaded { get; set; }
        public string Text { get; set; }
        public string IVBase64 { get; set; }
        public int ReplyId { get; set; }
    }
}
