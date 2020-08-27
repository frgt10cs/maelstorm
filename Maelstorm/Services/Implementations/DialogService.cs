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
using System.Text.RegularExpressions;
using Newtonsoft.Json.Serialization;
using Maelstorm.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http;
using System.Data.Common;
using System.Security.Cryptography;
using StackExchange.Redis.Extensions.Core.Abstractions;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using Dialog = Maelstorm.Entities.Dialog;
using DialogDTO = MaelstormDTO.Responses.Dialog;
using MessageDTO = MaelstormDTO.Responses.Message;
using Message = Maelstorm.Entities.Message;

namespace Maelstorm.Services.Implementations
{
    public class DialogService : IDialogService
    {
        private readonly ISignalRSessionService sesServ;
        private readonly MaelstormContext context;
        private readonly ILogger<MaelstormContext> logger;
        private readonly IHubContext<MessageHub> messHub;        
        private readonly IHttpContextAccessor httpContext;
        private readonly ISQLService sqlService;
        private readonly ICryptographyService cryptoService;        
        private readonly JsonSerializerSettings serializerSettings;

        public DialogService(MaelstormContext context, ILogger<MaelstormContext> logger,
            IHubContext<MessageHub> messHub, IHttpContextAccessor httpContext,
            ISignalRSessionService sesServ, ISQLService sqlService, ICryptographyService cryptoService)
        {
            this.context = context;
            this.logger = logger;            
            this.messHub = messHub;            
            this.httpContext = httpContext;
            this.sesServ = sesServ;
            this.sqlService = sqlService;
            this.cryptoService = cryptoService;            
            serializerSettings = new JsonSerializerSettings();
            serializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        }

        #region Dialog creating

        public async Task<Dialog> CreateDialogAsync(int firstUserId, int secondUserId, bool isClosed = false)
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
            byte[] secret = cryptoService.GetRandomBytes(16);
            byte[] salt = cryptoService.GetRandomBytes(16);
            dialog.SaltBase64 = Convert.ToBase64String(salt);
            rsa.ImportSubjectPublicKeyInfo(Convert.FromBase64String(firstUser.PublicKey), out _);
            dialog.EncryptedFirstCryptoKey = Convert.ToBase64String(rsa.Encrypt(secret, RSAEncryptionPadding.OaepSHA256));
            rsa.ImportSubjectPublicKeyInfo(Convert.FromBase64String(secondUser.PublicKey), out _);
            dialog.EncryptedSecondCryptoKey = Convert.ToBase64String(rsa.Encrypt(secret, RSAEncryptionPadding.OaepSHA256));
            return dialog;
        }

        #endregion

        private bool DialogContainsUser(Dialog dialog, long userId)
        {
            return dialog.FirstUserId == userId || dialog.SecondUserId == userId;
        }

        #region Message sending       
        public async Task<DeliveredMessageInfo> SendDialogMessageAsync(int userId, SendMessageRequest messageRequest)
        {
            DeliveredMessageInfo deliveredMessageInfo = null;
            Dialog dialog = await context.Dialogs.FindAsync(messageRequest.DialogId);
            if (dialog != null && DialogContainsUser(dialog, userId))
            {
                if (!dialog.IsClosed)
                {                    
                    if (messageRequest.Text != null)
                    {                        
                        Message message = new Message()
                        {
                            AuthorId = userId,
                            DateOfSending = DateTime.Now,
                            DialogId = dialog.Id,
                            IVBase64 = messageRequest.IVBase64,
                            Text = messageRequest.Text,
                            IsVisibleForAuthor = true,
                            IsVisibleForOther = true
                        };               
                        context.DialogMessages.Add(message);                        
                        await context.SaveChangesAsync();

                        deliveredMessageInfo = new DeliveredMessageInfo()
                        {
                            MessageId = message.Id,
                            DateOfSending = message.DateOfSending
                        };

                        var messageDTO = ToMessageDTO(message);
                        await NewMessagePushAsync(messageDTO);
                    }
                }
                else
                {                    
                    logger.LogWarning($"Trying to send message into closed dialog. From: {userId}");
                }
            }
            else
            {                
                logger.LogWarning($"Trying to send message into dialog that doesn't exist. From: {userId}");
            }
            return deliveredMessageInfo;
        }
        #endregion

        #region Notifications
        private async Task NewMessagePushAsync(MessageDTO message)
        {            
            // ser after check is any?
            string messageJson = JsonConvert.SerializeObject(message, serializerSettings);         
            
            // send message to the target
            //var targetConnectionIds = (await sesServ.GetConnectionIdsAsync(message.TargetId.ToString())).ToList();
            //if (targetConnectionIds?.Any() ?? false)
            //    await messHub.Clients.Clients(targetConnectionIds).SendAsync("RecieveMessage", messageJson);

            // send message to the another author's connections
            string authorSessionId = httpContext.HttpContext.User.FindFirst("SessionId").Value;
            var authorId = message.AuthorId.ToString();
            var authorConnectionIds = (await sesServ.GetConnectionIdsAsync(authorId)).ToList();
            if (authorConnectionIds?.Count > 1)
            {
                var authorConnectionId = await sesServ.GetConnectionIdAsync(authorId, authorSessionId);
                authorConnectionIds.Remove(authorConnectionId);
                await messHub.Clients.Clients(authorConnectionIds).SendAsync("RecieveMessage", messageJson);
            }                
        }

        private async Task MessageWasReadedPushAsync(long userId, long conversationId, long messageId)
        {
            var connectionIds = (await sesServ.GetConnectionIdsAsync(userId.ToString())).ToList();
            await messHub.Clients.Clients(connectionIds).SendAsync("MessageWasReaded", conversationId, messageId);
        }

        public async Task SetMessageAsReadedAsync(int userId, int messageId)
        {
            if (messageId <= 0)
                return;
            Message message = await context.DialogMessages.FirstOrDefaultAsync(m => m.Id == messageId);
            if (message != null)
            {
                Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == message.DialogId);
                if (dialog != null)
                {
                    if ((dialog.FirstUserId == userId || dialog.SecondUserId == userId) && message.AuthorId != userId)
                    {
                        message.IsReaded = true;
                        await context.SaveChangesAsync();
                        await MessageWasReadedPushAsync(message.AuthorId, dialog.Id, messageId);
                    }
                }
            }
        }
        #endregion

        #region Getting messages
        public IQueryable<Message> GetOldMessages(int dialogId, int userId, int offset, int count)
        {
            var messages = context.DialogMessages
                .Where(m => m.DialogId == dialogId && m.AuthorId == userId ? m.IsVisibleForAuthor : (m.IsVisibleForOther && m.IsReaded == true))
                .OrderByDescending(m => m.DateOfSending)
                .Skip(offset)
                .Take(count);
            messages.Reverse();
            return messages;
        }

        public IQueryable<Message> GetNewMessages(int dialogId, int userId, int offset, int count)
        {
            return context.DialogMessages.
                Where(m => m.DialogId == dialogId 
                    && m.AuthorId != userId && m.IsReaded == false && m.IsVisibleForOther)
                .Skip(offset)
                .Take(count);
        }

        private MessageDTO ToMessageDTO(Message message)
        {
            return new MessageDTO()
            {
                AuthorId = message.AuthorId,
                DateOfSending = message.DateOfSending,
                DialogId = message.DialogId,
                IVBase64 = message.IVBase64,
                Text = message.Text
            };
        }

        public async Task<List<MessageDTO>> GetReadedDialogMessagesAsync(int userId, int dialogId, int offset, int count)
        {
            if (!(dialogId > 0 && offset >= 0 && count > 0 && count <= 100)) return null;
            List<MessageDTO> messages = null;
            Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == dialogId);
            if (dialog != null)
            {
                messages = await GetOldMessages(dialogId, userId, offset, count).Select(m=>ToMessageDTO(m)).ToListAsync();                   
            }
            return messages;
        }

        public async Task<List<MessageDTO>> GetUnreadedDialogMessagesAsync(int userId, int dialogId, int offset, int count)
        {
            if (!(dialogId > 0 && count > 0 && count <= 100)) return null;
            List<MessageDTO> messages = null;
            Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == dialogId);
            if(dialog != null)
            {
                messages = await GetNewMessages(dialogId, userId, offset, count).Select(m => ToMessageDTO(m)).ToListAsync();                    
            }
            return messages;
        }

      

        #endregion

        #region Uploading dialogs
        public async Task<List<DialogDTO>> GetDialogsAsync(int userId, int offset, int count)
        {
            List<DialogDTO> models = new List<DialogDTO>();
            User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                string sqlQuery = "select Dialogs.Id as DialogId, Dialogs.SaltBase64 as Salt, " +
                    "case when Dialogs.FirstUserId=@userId then Dialogs.EncryptedFirstCryptoKey else Dialogs.EncryptedSecondCryptoKey end as EncryptedKey, " +
                    "Users.id as InterlocutorId, Users.Image as Image, Users.Nickname, m.Id as MessageId, m.AuthorId, m.Text, m.IVBase64, m.DateOfSending, m.IsReaded " +
                    "from Dialogs inner join " +
                    "(select DialogMessages.Id, DialogMessages.AuthorId, DialogMessages.IVBase64, DialogMessages.Status, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text " +
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
                    DialogSqlConverter);                                              
            }
            return models;
        }               

        public async Task<DialogDTO> GetDialogAsync(int userId, int interlocutorId)
        {
            DialogDTO model = null;
            User user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {               
                Dialog dialog = await GetOrCreateDialogAsync(userId, interlocutorId);
                User interlocutor = await context.Users.FirstOrDefaultAsync(u => u.Id == interlocutorId);
                if (interlocutor != null)
                {
                    string sqlQuery = "select d.Id as Id, d.SaltBase64 as Salt, " +
                        "case when d.FirstUserId = @interlocutorId then d.EncryptedSecondCryptoKey else d.EncryptedFirstCryptoKey end as EncryptedKey, " +
                        " u.Id as InterlocutorId, u.Image as Image, u.Nickname as Title, m.Id as MessageId, m.AuthorId, m.Text, m.IVBase64, m.DateOfSending, m.IsReaded " +
                        "from (select * from Dialogs where id = @dialogId) as d left join "+
                        "(select DialogMessages.Id, DialogMessages.AuthorId, DialogMessages.IVBase64, DialogMessages.Status, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text "+
                        "from DialogMessages inner join "+
                        "(select DialogId, max(DateOfSending) as DateOfSending from DialogMessages "+
                        "where DialogId = @dialogId "+
                        "group by DialogId) x "+
                        "on DialogMessages.DateOfSending = x.DateOfSending and DialogMessages.DialogId = @dialogId) as m "+
                        "on d.id = m.DialogId "+
                        "inner join (select * from users where id = @interlocutorId) u on d.SecondUserId = u.Id or d.FirstUserId = u.Id";
                    model = (await sqlService.ExecuteAsync(sqlQuery,
                        new DbParameter[] 
                        {
                            new SqlParameter("@interlocutorId", interlocutorId),
                            new SqlParameter("@dialogId",dialog.Id)
                        },
                        DialogSqlConverter)).FirstOrDefault();                   
                }
            }
            return model;
        }

        private async Task<Dialog> GetOrCreateDialogAsync(int userId, int interlocutorId)
        {
            Dialog dialog;
            int[] ids = { userId, interlocutorId };
            Array.Sort(ids);
            dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.FirstUserId == ids[0] && d.SecondUserId == ids[1]);
            if (dialog == null)
            {
                dialog = await CreateDialogAsync(ids[0], ids[1]);
                context.Dialogs.Add(dialog);
                await context.SaveChangesAsync();
            }
            return dialog;
        }

        private async Task<List<DialogDTO>> DialogSqlConverter(DbDataReader reader)
        {
            var models = new List<DialogDTO>();
            while (await reader.ReadAsync())
            {
                models.Add(new DialogDTO()
                {
                    Id = reader.GetInt32(0),
                    SaltBase64 = reader.GetString(1),
                    EncryptedKey = reader.GetString(2),
                    InterlocutorId = reader.GetInt32(3),
                    InterlocutorImage = reader.GetString(4),
                    InterlocutorNickname = reader.GetString(5),
                    LastMessage = new MessageDTO()
                    {
                        Id = reader.GetInt32(6),
                        AuthorId = reader.GetInt32(7),
                        Text = reader.GetString(8),
                        IVBase64 = reader.GetString(9),
                        DateOfSending = reader.GetDateTime(10),
                        IsReaded = reader.GetBoolean(11)
                    }
                });
            }
            return models;
        }

        #endregion
    }
}