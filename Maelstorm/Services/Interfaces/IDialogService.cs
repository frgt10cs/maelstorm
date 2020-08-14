﻿using Maelstorm.Models;
using Maelstorm.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Maelstorm.Entities;

namespace Maelstorm.Services.Interfaces
{
    public interface IDialogService
    {
        Task<ServiceResult> SendDialogMessageAsync(int userId, MessageSendDTO model);
        Task<List<MessageDTO>> GetReadedDialogMessagesAsync(int userId, int dialogId, int offset, int count);
        Task<List<MessageDTO>> GetUnreadedDialogMessagesAsync(int userId, int dialogId, int offset, int count);
        Task<List<DialogDTO>> GetDialogsAsync(int userId, int stackNumber, int count);
        Task SetMessageAsReaded(int userId, int messageId);
        Task<DialogDTO> GetDialogAsync(int userId, int interlocutorId);
        Task<Dialog> CreateDialog(int firstUserId, int secondUserId, bool isClosed = false);
    }
}
