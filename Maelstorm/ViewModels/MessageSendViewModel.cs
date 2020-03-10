using Maelstorm.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.ViewModels
{
    public class MessageSendViewModel
    {             
        [Required]
        [Range(0, int.MaxValue)]
        public int BindId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int TargetId { get; set; }

        [MaxLength(4096)]
        [MinLength(2)]
        [Required]        
        public string Text { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int ReplyId { get; set; }       
    }
}