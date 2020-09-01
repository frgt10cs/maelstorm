using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Extensions
{
    public static class HtppContextExtensions
    {
        public static int GetUserId(this HttpContext context)
        {
            int.TryParse(context.User.FindFirst("UserId").Value, out int id);
            return id;
        }
    }
}
