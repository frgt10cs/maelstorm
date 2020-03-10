using Maelstorm.Models;
using System;

namespace Maelstorm.ViewModels
{
    public class SessionViewModel
    {
        public Session Session { get; set; }
        public SignalRSession SignalRSession { get; set; }
    }
}