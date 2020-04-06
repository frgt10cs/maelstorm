using Maelstorm.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class UserInfoDTO
    {
        public int Id { get; set; }
        public string Nickname { get; set; }
        public string Avatar { get; set; }
        public string Status { get; set; }
        public bool OnlineStatus { get; set; }

        public static implicit operator UserInfoDTO(User user)
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
