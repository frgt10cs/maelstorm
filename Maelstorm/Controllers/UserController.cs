using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Controllers
{
    [Authorize]
    public class UserController:Controller
    {        
        public UserController()
        {

        }
    }
}
