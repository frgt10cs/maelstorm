using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IEmailService
    {
        void SendMessageAsync(string email, string text, string subject);
    }
}
