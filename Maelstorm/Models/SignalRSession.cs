using System;
namespace Maelstorm.Models
{
    [Serializable]
    public class SignalRSession
    {
        public int UserId;
        public string SessionId;
        public string ConnectionId;
        public string Fingerprint;
        public string Ip;
        public DateTime StartedAt;
    }
}