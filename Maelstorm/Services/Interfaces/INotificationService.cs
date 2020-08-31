using MaelstormDTO.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface INotificationService
    {
        Task NewMassageNotifyAsync(Entities.Dialog dialog, Message message);
    }
}
