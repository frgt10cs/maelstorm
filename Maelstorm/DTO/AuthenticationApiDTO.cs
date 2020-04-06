using System.ComponentModel.DataAnnotations;

namespace Maelstorm.DTO
{
    // включает в себя данные об используемом приложении для общения с апи
    public class AuthenticationApiDTO:AuthenticationDTO
    {
        [Required(ErrorMessage = "AppId is required")]                      
        public long AppId { get; set; }

        [Required(ErrorMessage = "Secret key is required")]
        [MinLength(10, ErrorMessage = "Secret key is too short")]
        [MaxLength(40, ErrorMessage = "Secret key is too long")]
        public string SecretKey { get; set; }        
    }
}
