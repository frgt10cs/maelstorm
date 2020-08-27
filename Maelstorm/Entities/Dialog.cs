using System;

namespace Maelstorm.Entities
{
    public class Dialog
    {
        public long Id { get; set; }
        public int FirstUserId { get; set; }
        public int SecondUserId { get; set; }
        public bool IsClosed { get; set; }
        public string SaltBase64 { get; set; }
        public string EncryptedFirstCryptoKey { get; set; }
        public string EncryptedSecondCryptoKey { get; set; }
    }
}
