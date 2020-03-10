using Maelstorm.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Models
{
    public class User
    {
        public int Id { get; set; }
        public DateTime DateOfRegistration { get; set; }
        public string Email { get; set; }
        public string Nickname { get; set; }
        public string Image { get; set; }
        public string Salt { get; set; }
        public string PasswordHash { get; set; }
        public byte Role { get; set; }
        public string Status { get; set; }
        public bool EmailIsConfirmed { get; set; }  
        
        public static explicit operator UserFindInfoViewModel(User user)
        {
            return new UserFindInfoViewModel()
            {
                Nickname = user.Nickname,
                UserId = user.Id,
                MiniAvatar = user.Image
            };
        }

        public static explicit operator UserInfoViewModel(User user)
        {
            return new UserInfoViewModel()
            {
                Id = user.Id,
                Avatar = user.Image,
                Nickname = user.Nickname,
                Status = user.Status
            };
        }
    }
}
