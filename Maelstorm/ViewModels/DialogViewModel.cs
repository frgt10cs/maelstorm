using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.ViewModels
{
    public class DialogViewModel
    {
        public int Id;
        public string Title;
        public long LastMessageNumber;
        public string LastMessageText;
        public DateTime? LastMessageDate;
        public string Image;
        public int InterlocutorId;        
    }
}
