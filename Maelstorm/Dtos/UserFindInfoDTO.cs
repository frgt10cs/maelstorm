using Maelstorm.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class UserFindInfoDTO
    {
        public int Id { get; set; }
        public string Nickname { get; set; }
        public string MiniAvatar { get; set; }

        public static implicit operator UserFindInfoDTO(User user)
        {
            return new UserFindInfoDTO()
            {
                Nickname = user.Nickname,
                Id = user.Id,
                MiniAvatar = user.Image
            };

        }
    }
}
