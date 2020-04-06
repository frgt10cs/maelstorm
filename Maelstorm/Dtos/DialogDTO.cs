using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class DialogDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public long LastMessageNumber { get; set; }
        public string LastMessageText { get; set; }
        public DateTime? LastMessageDate { get; set; }
        public string Image { get; set; }
        public int InterlocutorId { get; set; }
    }
}
