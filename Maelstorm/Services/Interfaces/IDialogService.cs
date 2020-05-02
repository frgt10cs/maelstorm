using Maelstorm.Models;
using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IDialogService
    {
        Task<ServiceResult> SendDialogMessageAsync(MessageSendDTO model);
        Task<List<MessageDTO>> GetReadedDialogMessagesAsync(int dialogId, int offset, int count);
        Task<List<MessageDTO>> GetUnreadedDialogMessagesAsync(int dialogId, int offset, int count);
        Task<List<DialogDTO>> GetDialogsAsync(int stackNumber, int count);
        Task SetMessageAsReaded(int messageId);
        Task<DialogDTO> GetDialogAsync(int interlocutorId);
    }
}
