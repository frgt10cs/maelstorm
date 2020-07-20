using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class MessageSearchResult
    {
        public int DialogId { get; set; }
        public string Text { get; set; }
        public int AuthorId { get; set; }
        public int InterlocutorId { get; set; }
        public string Title { get; set; }
        public string Avatar { get; set; }
        public int MessageId { get; set; }
        public string MessageText { get; set; }
    }
}
