using System;
using System.Collections.Generic;

namespace Maelstorm.Entities
{
    public class Dialog
    {
        public long Id { get; set; }
        public bool IsClosed { get; set; }
        public string SaltBase64 { get; set; }
        public IEnumerable<DialogUser> DialogUsers { get; set; }
        public IEnumerable<Message> Messages { get; set; }
    }
}
