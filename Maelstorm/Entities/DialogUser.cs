using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Entities
{
    public class DialogUser
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public User User { get; set; }
        public long DialogId { get; set; } 
        public Dialog Dialog { get; set; }    
        public string UserEncryptedDialogKey { get; set; }
    }
}
