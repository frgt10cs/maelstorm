using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Maelstorm.Attributes.Validations
{
    public class NicknameRequiredSymbols : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var regexItem = new Regex("^[a-zA-Z0-9]+$");
            string str = (string)value;
            if (!String.IsNullOrWhiteSpace(str))
                if (regexItem.IsMatch(str) && (str.IndexOf(' ') == -1))
                    return ValidationResult.Success;
            return new ValidationResult("Nickname can include only letters and numbers");
        }
    }

}
