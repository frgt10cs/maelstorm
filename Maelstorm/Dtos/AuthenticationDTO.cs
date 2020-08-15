using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class AuthenticationDTO
    {
        [Required(ErrorMessage = "Login is required")]        
        [MinLength(4, ErrorMessage = "Login is too short")]
        [MaxLength(20, ErrorMessage = "Login is too long")]        
        public string Login { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(10, ErrorMessage = "Password is too short. Minimum length is 10")]
        [MaxLength(60, ErrorMessage = "Password is too long. Maximum length is 60")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        [Required]
        public string Fingerprint { get; set; }
        public string OsCpu { get; set; }
        public string App { get; set; }
    }
}
