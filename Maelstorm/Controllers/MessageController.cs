using Maelstorm.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Controllers
{    
    public class MessageController:Controller
    {        
        [ActionName("Conversations")]
        public IActionResult Conversations()
        {
            return View();
        }
    }
}
