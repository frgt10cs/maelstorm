﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Dtos
{
    public class OnlineStatusDTO
    {
        public int UserId { get; set; }
        public bool IsOnline { get; set; }
    }
}