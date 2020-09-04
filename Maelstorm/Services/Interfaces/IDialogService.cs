using System.Collections.Generic;
using System.Threading.Tasks;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Dialog = MaelstormDTO.Responses.Dialog;
using Message = MaelstormDTO.Responses.Message;

namespace Maelstorm.Services.Interfaces
{
    public interface IDialogService
    {
        Task<DeliveredMessageInfo> SendDialogMessageAsync(SendMessageRequest model, long userId);
        Task<List<Message>> GetReadedMessagesAsync(long userId, long dialogId, int offset, int count);
        Task<List<Message>> GetUnreadedMessagesAsync(long userId, long dialogId, int offset, int count);
        Task<List<Dialog>> GetDialogsAsync(long userId, int offset, int count);
        Task SetMessageAsReadedAsync(long userId, long messageId);
        Task<Dialog> GetDialogAsync(long userId, long interlocutorId);
        Task<Entities.Dialog> CreateDialogAsync(long firstUserId, long secondUserId, bool isClosed = false);
    }
}
