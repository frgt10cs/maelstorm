using System;

namespace Maelstorm.Dtos 
{
    public class TokensDTO
    {
        public string AccessToken { get; set; }
        public DateTime GenerationTime { get; set; }
        public string RefreshToken { get; set; }
    }
}