using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Authorization
{
    public class SignalRAuthorized : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        private IDistributedCache cache;
        public SignalRAuthorized(/*IDistributedCache cache*/)
        {
            //this.cache = cache;
        }     

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var c = context.HttpContext;
            return;
        }
    }
}
