using Maelstorm.Attributes.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.ViewModels
{
    public class RegistrationViewModel
    {
        [Required(ErrorMessage ="Nickname is required")]
        [MinLength(3,ErrorMessage ="Nickname is too short. Minimum length is 3")]
        [MaxLength(10, ErrorMessage ="Nickname is too long. Maximum length is 10")]
        [NicknameRequiredSymbols]
        public string Nickname { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage ="Not email address")]
        [MinLength(10, ErrorMessage ="Email is too short")]
        [MaxLength(30, ErrorMessage ="Email is too long")]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(10,ErrorMessage ="Password is too short. Minimum length is 10")]
        [MaxLength(60, ErrorMessage ="Password is too long. Maximum length is 60")]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(10, ErrorMessage = "Password is too short. Minimum length is 10")]
        [MaxLength(60, ErrorMessage = "Password is too long. Maximum length is 60")]
        [DataType(DataType.Password)]
        [Compare("Password",ErrorMessage ="Passwords are not same")]
        public string ConfirmPassword { get; set; }
    }
}
