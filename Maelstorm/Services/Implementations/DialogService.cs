using Maelstorm.Database;
using Maelstorm.Models;
using Maelstorm.Entities;
using Maelstorm.Services.Interfaces;
using Maelstorm.Dtos;
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
using System.Data.Common;
using Microsoft.Data.Sqlite;
using System.Security.Cryptography;
using System.Text;

namespace Maelstorm.Services.Implementations
{
    public class DialogService : IDialogService
    {
        private ISignalRSessionService sesServ;
        private MaelstormContext context;
        private ILogger<MaelstormContext> logger;        
        private IHubContext<MessageHub> messHub;
        private IDistributedCache cache;
        private IHttpContextAccessor httpContext;
        private ISQLService sqlService;
        private ICryptographyService cryptoService;
        private readonly int userId;
        private readonly JsonSerializerSettings serializerSettings;

        public DialogService(MaelstormContext context, ILogger<MaelstormContext> logger,
            IHubContext<MessageHub> messHub, IDistributedCache cache, IHttpContextAccessor httpContext,
            ISignalRSessionService sesServ, ISQLService sqlService, ICryptographyService cryptoService)
        {
            this.context = context;
            this.logger = logger;            
            this.messHub = messHub;
            this.cache = cache;
            this.httpContext = httpContext;
            this.sesServ = sesServ;
            this.sqlService = sqlService;
            this.cryptoService = cryptoService;
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
                dialog = await CreateDialog(ids[0], ids[1]);
                context.Dialogs.Add(dialog);
                await context.SaveChangesAsync();
            }
            return dialog;
        }

        private async Task<Dialog> CreateDialog(int firstUserId, int secondUserId, bool isClosed = false)
        {
            using var rsa = RSA.Create(2048);                      
            User firstUser = await context.Users.FirstOrDefaultAsync(u => u.Id == firstUserId);
            User secondUser = await context.Users.FirstOrDefaultAsync(u => u.Id == secondUserId);
            Dialog dialog = new Dialog()
            {
                FirstUserId = firstUserId,
                SecondUserId = secondUserId,
                IsClosed = isClosed                               
            };
            string secret = cryptoService.GetRandomBase64String(128);            
            rsa.ImportRSAPublicKey(Convert.FromBase64String(firstUser.PublicKey), out _);
            dialog.EncryptedFirstCryptoKey = Convert.ToBase64String(rsa.Encrypt(Encoding.UTF8.GetBytes(secret), RSAEncryptionPadding.OaepSHA256));
            rsa.ImportRSAPublicKey(Convert.FromBase64String(secondUser.PublicKey), out _);
            dialog.EncryptedSecondCryptoKey = Convert.ToBase64String(rsa.Encrypt(Encoding.UTF8.GetBytes(secret), RSAEncryptionPadding.OaepSHA256));
            return dialog;
        }

        public async Task<ServiceResult> SendDialogMessageAsync(MessageSendDTO model)
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
                        await context.SaveChangesAsync();
                        MessageDeliveredDTO confirm = new MessageDeliveredDTO()
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
            var messageViewModel = new MessageDTO()
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

        private async Task<List<MessageDTO>> ToMessageViewModelsAsync(IQueryable<DialogMessage> messages)
        {
            return await messages.Select(m => new MessageDTO()
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

        public async Task<List<MessageDTO>> GetReadedDialogMessagesAsync(int dialogId, int offset, int count)
        {
            if (!(dialogId > 0 && offset >= 0 && count > 0 && count <= 100)) return null;
            List<MessageDTO> messages = null;
            Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == dialogId);
            if (dialog != null)
            {
                messages = await ToMessageViewModelsAsync(GetOldMessages(dialogId, userId, offset, count));                   
            }
            return messages;
        }

        public async Task<List<MessageDTO>> GetUnreadedDialogMessagesAsync(int dialogId, int count)
        {
            if (!(dialogId > 0 && count > 0 && count <= 100)) return null;
            List<MessageDTO> messages = null;
            Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == dialogId);
            if(dialog != null)
            {
                messages = await ToMessageViewModelsAsync(GetNewMessages(dialogId, userId, count));                    
            }
            return messages;
        }

        public async Task<List<DialogDTO>> GetDialogsAsync(int offset, int count)
        {
            List<DialogDTO> models = new List<DialogDTO>();
            User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                string sqlQuery = "select Dialogs.Id as DialogId, Users.id as InterlocutorId, Users.Image as Image, Users.Nickname, m.Text, m.DateOfSending " +
                    "from Dialogs inner join " +
                    "(select DialogMessages.Id, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text " +
                    "from DialogMessages inner join " +
                    "(select DialogId, max(DateOfSending) as DateOfSending from DialogMessages " +
                    "where (DialogMessages.AuthorId = @userId and DialogMessages.IsVisibleForAuthor = 1) " +
                    "or(DialogMessages.AuthorId != @userId and DialogMessages.IsVisibleForOther = 1) group by DialogId) x " +
                    "on DialogMessages.DateOfSending = x.DateOfSending and DialogMessages.DialogId = x.DialogId) as m " +
                    "on Dialogs.id = m.DialogId " +
                    "inner join Users on " +
                    "(Dialogs.FirstUserId = @userId and Users.id = Dialogs.SecondUserId) " +
                    "or(Dialogs.SecondUserId = @userId and Users.id = Dialogs.FirstUserId) " +
                    "order by m.DateOfSending " +
                    "offset @offsetCount rows " +
                    "fetch next @count rows only";
                models = await sqlService.ExecuteAsync(sqlQuery,
                    new DbParameter[] 
                    {
                        new SqlParameter("@userId", userId),
                        new SqlParameter("@offsetCount", offset),
                        new SqlParameter("@count", count)
                    },
                    DialogViewModelSqlCoverter);                                              
            }
            return models;
        }
        
        public async Task<List<DialogDTO>> DialogViewModelSqlCoverter(DbDataReader reader)
        {
            var models = new List<DialogDTO>();
            while (await reader.ReadAsync())
            {
                models.Add(new DialogDTO()
                {
                    Id = reader.GetInt32(0),
                    InterlocutorId = reader.GetInt32(1),
                    Image = reader.GetString(2),
                    Title = reader.GetString(3),
                    LastMessageText = reader.SafeGetString(4),
                    LastMessageDate = reader.SafeGetDate(5)
                });
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

        public async Task<DialogDTO> GetDialogAsync(int interlocutorId)
        {
            DialogDTO model = null;
            User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {               
                Dialog dialog = await GetOrCreateDialogAsync(interlocutorId);
                User targetUser = await context.Users.FirstOrDefaultAsync(u => u.Id == interlocutorId);
                if (targetUser != null)
                {
                    string sqlQuery = "select d.Id as Id, u.Id as InterlocutorId, u.Image as Image, u.Nickname as Title,  m.Text as LastMessageText, m.DateOfSending as LastMessageDate " +
                    "from (select * from Dialogs where id = @dialogId) as d left join "+
                    "(select DialogMessages.Id, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text "+
                    "from DialogMessages inner join "+
                    "(select DialogId, max(DateOfSending) as DateOfSending from DialogMessages "+
                    "where DialogId = @dialogId "+
                    "group by DialogId) x "+
                    "on DialogMessages.DateOfSending = x.DateOfSending and DialogMessages.DialogId = @dialogId) as m "+
                    "on d.id = m.DialogId "+
                    "inner join (select* from users where id = @interlocutorId) u on d.SecondUserId = u.Id or d.FirstUserId = u.Id";
                    model = (await sqlService.ExecuteAsync(sqlQuery,
                        new DbParameter[] 
                        {
                            new SqlParameter("@interlocutorId", interlocutorId),
                            new SqlParameter("@dialogId",dialog.Id)
                        },
                        DialogViewModelSqlCoverter)).FirstOrDefault();                   
                }
            }
            return model;
        }
    }
}