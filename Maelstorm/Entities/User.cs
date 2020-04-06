﻿using System;
using System.ComponentModel.DataAnnotations;

namespace Maelstorm.Entities
{
    public class User
    {
        public int Id { get; set; }
        public DateTime DateOfRegistration { get; set; }
        public string Email { get; set; }
        public string Nickname { get; set; }
        public string Image { get; set; }
        public string Salt { get; set; }
        public string PasswordHash { get; set; }
        public byte Role { get; set; }
        public string Status { get; set; }
        public bool EmailIsConfirmed { get; set; }  
        public string PublicKey { get; set; }
        public string EncryptedPrivateKey { get; set; }        
        public string IVBase64 { get; set; }
    }
}
