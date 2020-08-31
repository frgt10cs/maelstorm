using Maelstorm.Hubs;
using Maelstorm.Services.Interfaces;
using MaelstormDTO.Responses;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<MessageHub> messageHubContext;
        private readonly ISignalRSessionService signlarSessionService;
        public NotificationService(IHubContext<MessageHub> messageHubContext, ISignalRSessionService signlarSessionService)
        {
            this.messageHubContext = messageHubContext;
            this.signlarSessionService = signlarSessionService;
        }

        public async Task NewMassageNotifyAsync(Entities.Dialog dialog, Message message)
        {
            var connectionIds = new List<string>();
            var authorId = dialog.DialogUsers.Single(du => du.UserId == message.AuthorId).UserId.ToString();
            var recieverId = dialog.DialogUsers.Single(du => du.UserId != message.AuthorId).UserId.ToString();

            var recieverConnectionIds = await signlarSessionService.GetConnectionIdsAsync(recieverId);
            if (recieverConnectionIds != null)
                connectionIds.AddRange(recieverConnectionIds);
                        
            var authorConnectionIds = (await signlarSessionService.GetConnectionIdsAsync(authorId)).ToList();
            if (authorConnectionIds?.Count > 1)
            {                                
                connectionIds.AddRange(authorConnectionIds);
            }

            if (connectionIds.Any())
            {
                var messageJson = JsonConvert.SerializeObject(message);
                await messageHubContext.Clients.Clients(connectionIds).SendAsync("RecieveMessage", messageJson);
            }
        }

        private async Task MessageWasReadedPushAsync(long recieverId, long dialogId, long messageId)
        {
            var connectionIds = (await signlarSessionService.GetConnectionIdsAsync(recieverId.ToString())).ToList();
            await messageHubContext.Clients.Clients(connectionIds).SendAsync("MessageWasReaded", dialogId, messageId);
        }
    }
}
