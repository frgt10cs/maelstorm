using System;

namespace Maelstorm.Dtos
{
    public class CloseSessionDTO
    {
        public string SessionId { get; set; }
        public bool BanDevice { get; set; }
    }
}