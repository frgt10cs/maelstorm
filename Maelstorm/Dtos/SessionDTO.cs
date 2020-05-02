using Maelstorm.Models;
using Maelstorm.Entities;
using System;

namespace Maelstorm.Dtos
{
    public class SessionDTO
    {
        public Session Session { get; set; }
        public SignalRSession SignalRSession { get; set; }
    }
}