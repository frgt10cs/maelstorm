using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.ViewModels
{
    public class MessageViewModel
    {
        public int Id;
        public int AuthorId;        
        public int DialogId;
        public DateTime DateOfSending;
        public byte Status;
        public string Text;         
    }
}
