using System;

namespace Maelstorm.Dtos 
{
    public class HubAuthorizationDTO
    {
        public string Token { get; set; }
        public string Fingerprint { get; set; }
    }
}