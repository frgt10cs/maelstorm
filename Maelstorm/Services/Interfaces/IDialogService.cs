using Maelstorm.Models;
using Maelstorm.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Maelstorm.Services.Interfaces
{
    public interface IDialogService
    {
        Task<ServiceResult> SendDialogMessageAsync(MessageSendViewModel model);
        Task<List<MessageViewModel>> GetReadedDialogMessagesAsync(int dialogId, int offset, int count);
        Task<List<MessageViewModel>> GetUnreadedDialogMessagesAsync(int dialogId, int count);
        Task<List<DialogViewModel>> GetDialogsAsync(int stackNumber, int count);
        Task SetMessageAsReaded(int messageId);
        Task<DialogViewModel> GetDialogAsync(int interlocutorId);
    }
}
