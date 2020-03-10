using Maelstorm.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Models
{
    public class Dialog
    {
        public int Id { get; set; }
        public int FirstUserId { get; set; }
        public int SecondUserId { get; set; }
        public bool IsClosed { get; set; }
        public DateTime LastActive { get; set; }
    }
}
