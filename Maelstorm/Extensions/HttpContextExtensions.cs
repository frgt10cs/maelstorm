using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Maelstorm.Extensions
{
    public static class HtppContextExtensions
    {
        public static int GetUserId(this HttpContext context)
        {
            int.TryParse(context.User.FindFirst("UserId").Value, out int id);
            return id;
        }

        public static string GetSessionId(this HttpContext context)
        {
            return context.User.FindFirstValue("SessionId");
        }
    }
}
