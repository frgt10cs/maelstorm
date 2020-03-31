using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.ViewModels
{
    public class MessageDeliveredViewModel
    {
        public int BindId { get; set; }
        public int Id { get; set; }
        public DateTime SentAt { get; set; }
    }
}
