using Maelstorm.Database;
using Maelstorm.Models;
using Maelstorm.Services.Interfaces;
using Maelstorm.ViewModels;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Serialization;
using Maelstorm.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.AspNetCore.Http;
using Maelstorm.Extensions;

namespace Maelstorm.Services.Implementations
{
    public class DialogService : IDialogService
    {
        private ISignalRSessionService sesServ;
        private MaelstormRepository context;
        private ILogger<MaelstormContext> logger;        
        private IHubContext<MessageHub> messHub;
        private IDistributedCache cache;
        private IHttpContextAccessor httpContext;
        private readonly int userId;
        private readonly JsonSerializerSettings serializerSettings;

        public DialogService(MaelstormRepository context, ILogger<MaelstormContext> logger,
            IHubContext<MessageHub> messHub, IDistributedCache cache, IHttpContextAccessor httpContext, ISignalRSessionService sesServ)
        {
            this.context = context;
            this.logger = logger;            
            this.messHub = messHub;
            this.cache = cache;
            this.httpContext = httpContext;
            this.sesServ = sesServ;
            userId = httpContext.HttpContext.GetUserId();
            serializerSettings = new JsonSerializerSettings();
            serializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        }

        private async Task<Dialog> GetOrCreateDialogAsync(int interlocutorId)
        {            
            Dialog dialog;
            int[] ids = { userId, interlocutorId };
            Array.Sort(ids);
            dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.FirstUserId == ids[0] && d.SecondUserId == ids[1]);
            if (dialog == null)
            {
                dialog = new Dialog()
                {
                    FirstUserId = ids[0],
                    SecondUserId = ids[1],
                    IsClosed = false
                };
                context.Dialogs.Add(dialog);
                await context.SaveChangesAsync();
            }
            return dialog;
        }

        public async Task<ServiceResult> SendDialogMessageAsync(MessageSendViewModel model)
        {            
            ServiceResult result = new ServiceResult();
            Dialog dialog = await GetOrCreateDialogAsync(model.TargetId);
            if (dialog != null)
            {
                if (!dialog.IsClosed)
                {
                    string text = ValidateMessageText(model.Text);
                    if (text != null)
                    {
                        model.Text = text;
                        DialogMessage message = new DialogMessage(model, userId, dialog.Id);                        
                        context.DialogMessages.Add(message);
                        dialog.LastActive = message.DateOfSending;
                        await context.SaveChangesAsync();
                        MessageDeliveredViewModel confirm = new MessageDeliveredViewModel()
                        {
                            Id = message.Id,
                            BindId = model.BindId,
                            SentAt = message.DateOfSending
                        };                        
                        result.Data = JsonConvert.SerializeObject(confirm, serializerSettings);
                        await NewMessagePush(message);
                    }
                }
                else
                {
                    result.SetFail("Диалог заблокирован");
                    logger.LogWarning($"Trying to send message in closed dialog. AuthorId: {userId} To: {model.TargetId}");
                }
            }
            else
            {
                result.SetFail("Диалог не существует");
                logger.LogWarning($"Trying to send message in dialog that doesn't exist. AuthorId: {userId} To: {model.TargetId}");
            }
            return result;
        }        

        private async Task NewMessagePush(DialogMessage message)
        {
            var messageViewModel = new MessageViewModel()
            {
                Id = message.Id,
                AuthorId = message.AuthorId,                
                DialogId = message.DialogId,
                DateOfSending = message.DateOfSending,
                Status = message.Status,
                Text = message.Text
            };            
            string messageJson = JsonConvert.SerializeObject(messageViewModel, serializerSettings);
            var targetIds = await sesServ.GetConnectionIdsAsync(message.TargetId);
            if (targetIds?.Any() ?? false)
                await messHub.Clients.Clients(targetIds).SendAsync("RecieveMessage", messageJson);
            string authorSessionId = httpContext.HttpContext.User.FindFirst("SessionId").Value;            
            var authorIds = await sesServ.GetConnectionIdsAsync(message.AuthorId, (SignalRSession s) => s.SessionId != authorSessionId);
            if (authorIds?.Any() ?? false)
                await messHub.Clients.Clients(authorIds).SendAsync("RecieveMessage", messageJson);
        }

        private async Task MessageWasReadedPush(int userId, int conversationId, int messageId)
        {
            var connectionIds = await sesServ.GetConnectionIdsAsync(userId);
            await messHub.Clients.Clients(connectionIds).SendAsync("MessageWasReaded", conversationId, messageId);
        }

        //private async Task DialogCreatedPush(int userId, DialogViewModel model)
        //{
        //    await messHub.Clients.Group(userId.ToString()).SendAsync("DialogIsCreated", model);
        //}

        public IQueryable<DialogMessage> GetOldMessages(int dialogId, int userId, int offset, int count)
        {
            var messages = context.DialogMessages
                .Where(m => m.DialogId == dialogId && m.AuthorId == userId ? m.IsVisibleForAuthor : (m.IsVisibleForOther && m.Status == 1))
                .OrderByDescending(m => m.DateOfSending)
                .Skip(offset)
                .Take(count);
            messages.Reverse();
            return messages;
        }

        public IQueryable<DialogMessage> GetNewMessages(int dialogId, int userId, int count)
        {
            return context.DialogMessages.
                Where(m => m.DialogId == dialogId 
                    && m.AuthorId != userId && m.Status == 0 && m.IsVisibleForOther)                
                .Take(count);
        }

        private async Task<List<MessageViewModel>> ToMessageViewModelsAsync(IQueryable<DialogMessage> messages)
        {
            return await messages.Select(m => new MessageViewModel()
            {
                Id = m.Id,
                AuthorId = m.AuthorId,                
                DialogId = m.DialogId,
                DateOfSending = m.DateOfSending,
                Status = m.Status,
                Text = m.Text
            })
            .ToListAsync();
        }

        public async Task<List<MessageViewModel>> GetReadedDialogMessagesAsync(int dialogId, int offset, int count)
        {
            if (!(dialogId > 0 && offset >= 0 && count > 0 && count <= 100)) return null;
            List<MessageViewModel> messages = null;
            Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == dialogId);
            if (dialog != null)
            {
                messages = await ToMessageViewModelsAsync(GetOldMessages(dialogId, userId, offset, count));                   
            }
            return messages;
        }

        public async Task<List<MessageViewModel>> GetUnreadedDialogMessagesAsync(int dialogId, int count)
        {
            if (!(dialogId > 0 && count > 0 && count <= 100)) return null;
            List<MessageViewModel> messages = null;
            Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == dialogId);
            if(dialog != null)
            {
                messages = await ToMessageViewModelsAsync(GetNewMessages(dialogId, userId, count));                    
            }
            return messages;
        }

        // отпимизировать
        public async Task<List<DialogViewModel>> GetDialogsAsync(int stackNumber, int count)
        {
            List<DialogViewModel> models = new List<DialogViewModel>();
            User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                var dialogs = context.Dialogs.Where(d => d.FirstUserId == userId || d.SecondUserId == userId)
                    .OrderByDescending(d => d.LastActive);                    
                foreach(var dialog in dialogs)
                {                    
                    var lastMessage = await context.DialogMessages.LastOrDefaultAsync(m => m.DialogId == dialog.Id
                        && (m.AuthorId == userId ? m.IsVisibleForAuthor : m.IsVisibleForOther));
                    if(lastMessage != null)
                    {
                        int interlocutorId = dialog.FirstUserId == userId ? dialog.SecondUserId : dialog.FirstUserId;
                        User target = await context.Users.FirstOrDefaultAsync(u => u.Id == interlocutorId);
                        models.Add(new DialogViewModel()
                        {
                            Id = dialog.Id,
                            Image = target.Image,
                            LastMessageDate = lastMessage.DateOfSending,
                            LastMessageText = lastMessage.Text,
                            InterlocutorId = interlocutorId,
                            Title = target.Nickname
                        });
                    }
                }
                models = models.Skip((stackNumber - 1) * count).Take(count).ToList();                          
            }
            return models;
        }
        
        public async Task SetMessageAsReaded(int messageId)
        {
            if (messageId <= 0)
                return;
            DialogMessage message = await context.DialogMessages.FirstOrDefaultAsync(m => m.Id == messageId);
            if (message != null)
            {
                Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == message.DialogId);
                if (dialog != null)
                {
                    if ((dialog.FirstUserId == userId || dialog.SecondUserId == userId) && message.AuthorId != userId)
                    {
                        message.Status = 1;
                        await context.SaveChangesAsync();
                        await MessageWasReadedPush(message.AuthorId, dialog.Id, messageId);
                    }
                }
            }
        }           

        /// <summary>
        /// Валидация текста сообщения
        /// </summary>
        /// <param name="text"></param>
        /// <returns>Возвращает отформатированный по правилам текст. Null в случае невалидности текста</returns>
        private string ValidateMessageText(string text)
        {
            if (!String.IsNullOrWhiteSpace(text))
            {
                text = text.Trim();
                text = Regex.Replace(text, @"\s+", " ");
                if (text.Length > 1 && text.Length <= 4096)
                {
                    return text;
                }
            }
            return null;
        }

        public async Task<DialogViewModel> GetDialogAsync(int interlocutorId)
        {
            DialogViewModel model = null;
            User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                int[] ids = { userId, interlocutorId };
                Array.Sort(ids);
                Dialog dialog = await GetOrCreateDialogAsync(interlocutorId);
                User targetUser = await context.Users.FirstOrDefaultAsync(u => u.Id == interlocutorId);
                if (targetUser != null)
                {
                    DialogMessage message = await context.DialogMessages.LastOrDefaultAsync(m => m.DialogId == dialog.Id);
                    model = new DialogViewModel()
                    {
                        Id = dialog.Id,
                        Image = targetUser.Image,
                        LastMessageDate = message?.DateOfSending,
                        LastMessageText = message?.Text,
                        InterlocutorId = interlocutorId,
                        Title = targetUser.Nickname
                    };
                }
            }
            return model;
        }
    }
}