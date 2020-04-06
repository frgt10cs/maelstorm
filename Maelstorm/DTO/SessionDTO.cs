using Maelstorm.Models;
using System;

namespace Maelstorm.DTO
{
    public class SessionDTO
    {
        public Session Session { get; set; }
        public SignalRSession SignalRSession { get; set; }
    }
}