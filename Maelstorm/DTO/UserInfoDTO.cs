using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.DTO
{
    public class UserInfoDTO
    {
        public int Id { get; set; }
        public string Nickname { get; set; }
        public string Avatar { get; set; }
        public string Status { get; set; }
        public bool OnlineStatus { get; set; }
    }
}
