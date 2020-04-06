using Maelstorm.DTO;
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

        public string PublicKey { get; set; }
        public string EncryptedPrivateKey { get; set; }
        
        public static explicit operator UserFindInfoDTO(User user)
        {
            return new UserFindInfoDTO()
            {
                Nickname = user.Nickname,
                Id = user.Id,
                MiniAvatar = user.Image
            };
        }

        public static explicit operator UserInfoDTO(User user)
        {
            return new UserInfoDTO()
            {
                Id = user.Id,
                Avatar = user.Image,
                Nickname = user.Nickname,
                Status = user.Status
            };
        }
    }
}
