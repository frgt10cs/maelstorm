using Maelstorm.Models;
using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Entities;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Dialog = MaelstormDTO.Responses.Dialog;
using Message = MaelstormDTO.Responses.Message;

namespace Maelstorm.Services.Interfaces
{
    public interface IDialogService
    {
        Task<DeliveredMessageInfo> SendDialogMessageAsync(int userId, SendMessageRequest model);
        Task<List<Message>> GetReadedDialogMessagesAsync(int userId, int dialogId, int offset, int count);
        Task<List<Message>> GetUnreadedDialogMessagesAsync(int userId, int dialogId, int offset, int count);
        Task<List<Dialog>> GetDialogsAsync(int userId, int stackNumber, int count);
        Task SetMessageAsReadedAsync(int userId, int messageId);
        Task<Dialog> GetDialogAsync(int userId, int interlocutorId);
        Task<Entities.Dialog> CreateDialogAsync(int firstUserId, int secondUserId, bool isClosed = false);
    }
}
