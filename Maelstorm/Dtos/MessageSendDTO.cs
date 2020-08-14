using Maelstorm.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class MessageSendDTO
    {                     
        [Required]
        public int InterlocutorId { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int BindId { get; set; }        

        [MaxLength(4096)]
        [MinLength(1)]
        [Required]        
        public string Text { get; set; }
        
        [StringLength(24)]
        [Required]
        public string IVBase64 { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int ReplyId { get; set; }       
    }
}