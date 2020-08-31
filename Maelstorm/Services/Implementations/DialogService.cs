using Maelstorm.Database;
using Maelstorm.Entities;
using Maelstorm.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;
using Maelstorm.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http;
using System.Data.Common;
using System.Security.Cryptography;
using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using DialogDTO = MaelstormDTO.Responses.Dialog;
using MessageDTO = MaelstormDTO.Responses.Message;
using Dialog = Maelstorm.Entities.Dialog;
using Message = Maelstorm.Entities.Message;
using Org.BouncyCastle.Security;

namespace Maelstorm.Services.Implementations
{
    public class DialogService : IDialogService
    {        
        private readonly MaelstormContext context;
        private readonly ILogger<DialogService> logger;                       
        private readonly ICryptographyService cryptoService;        
        private readonly JsonSerializerSettings serializerSettings;
        private readonly INotificationService notificationService;

        public DialogService(MaelstormContext context, ILogger<DialogService> logger,
            ICryptographyService cryptoService, INotificationService notificationService)
        {
            this.context = context;
            this.logger = logger;                                                   
            this.cryptoService = cryptoService;
            this.notificationService = notificationService;
            serializerSettings = new JsonSerializerSettings();
            serializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        }

        #region Dialog creating

        public async Task<Dialog> CreateDialogAsync(long firstUserId, long secondUserId, bool isClosed = false)
        {                               
            User firstUser = await context.Users.FirstOrDefaultAsync(u => u.Id == firstUserId);
            User secondUser = await context.Users.FirstOrDefaultAsync(u => u.Id == secondUserId);
            byte[] salt = cryptoService.GetRandomBytes(16);
            var dialog = new Dialog()
            {
                IsClosed = false,
                SaltBase64 = Convert.ToBase64String(salt)
            };
            context.Dialogs.Add(dialog);

            byte[] secret = cryptoService.GetRandomBytes(16);

            var firstDialogUser = CreateDialogUser(dialog, firstUser, secret);
            var secondDialogUser = CreateDialogUser(dialog, secondUser, secret);

            context.DialogUsers.AddRange(firstDialogUser, secondDialogUser);
            await context.SaveChangesAsync();
            
            return dialog;
        }

        private DialogUser CreateDialogUser(Dialog dialog, User user, byte[] secret)
        {
            var rsa = RSA.Create(2048);
            rsa.ImportSubjectPublicKeyInfo(Convert.FromBase64String(user.PublicKey), out _);
            var userEncryptedDialogKey = Convert.ToBase64String(rsa.Encrypt(secret, RSAEncryptionPadding.OaepSHA256));
            var dialogUser = new DialogUser()
            {
                Dialog = dialog,
                User = user,
                UserEncryptedDialogKey = userEncryptedDialogKey
            };
            return dialogUser;
        }

        #endregion  

        #region Message sending       
        public async Task<DeliveredMessageInfo> SendDialogMessageAsync(SendMessageRequest messageRequest, long userId)
        {
            DeliveredMessageInfo deliveredMessageInfo = null;
            var dialog = await context.Dialogs.FindAsync(messageRequest.DialogId);
            if (dialog != null && dialog.DialogUsers.SingleOrDefault(du => du.UserId == userId) != null)
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
                            IsReaded = false                            
                        };               
                        context.Messages.Add(message);                        
                        await context.SaveChangesAsync();

                        deliveredMessageInfo = new DeliveredMessageInfo()
                        {
                            MessageId = message.Id,
                            DateOfSending = message.DateOfSending
                        };

                        var messageDTO = ToMessageDTO(message);
                        await notificationService.NewMassageNotifyAsync(dialog, messageDTO);
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

        public async Task SetMessageAsReadedAsync(long userId, long messageId)
        {
            if (messageId <= 0)
                return;
            Message message = await context.Messages.FirstOrDefaultAsync(m => m.Id == messageId);
            if (message != null)
            {
                Dialog dialog = await context.Dialogs.FirstOrDefaultAsync(d => d.Id == message.DialogId);
                if (dialog != null)
                {
                    //if ((dialog.FirstUserId == userId || dialog.SecondUserId == userId) && message.AuthorId != userId)
                    //{
                    //    message.IsReaded = true;
                    //    await context.SaveChangesAsync();
                    //    await MessageWasReadedPushAsync(message.AuthorId, dialog.Id, messageId);
                    //}
                }
            }
        }        

        #region Getting messages
        public async Task<IEnumerable<MessageDTO>> GetReadedMessagesAsync(long dialogId, long userId, int offset, int count)
        {
            var dialog = await context.Dialogs.FindAsync(dialogId);

            if (dialog != null && dialog.DialogUsers.SingleOrDefault(du => du.UserId == userId) != null)
            {
                var messages = dialog.Messages
                        .Where(m => m.IsReaded)
                        .OrderBy(m => m.DateOfSending)
                        .Skip(offset)
                        .Take(count)
                        .Select(m => ToMessageDTO(m));
                return messages;
            }
            logger.LogWarning($"User (ID: {userId}) tried to read messages from other people's dialog");
            return null;
        }

        public async Task<IEnumerable<MessageDTO>> GetUnreadedMessagesAsync(long dialogId, long userId, int offset, int count)
        {
            var dialog = await context.Dialogs.FindAsync(dialogId);

            if (dialog != null && dialog.DialogUsers.SingleOrDefault(du => du.UserId == userId) != null)
            {                
                var messages = dialog.Messages
                    .Where(m => !m.IsReaded)
                    .OrderBy(m => m.DateOfSending)
                    .Skip(offset)
                    .Take(count)
                    .Select(m => ToMessageDTO(m));
                return messages;
            }
            logger.LogWarning($"User (ID: {userId}) tried to read messages from other people's dialog");
            return null;
        }

        private MessageDTO ToMessageDTO(Message message)
        {
            return new MessageDTO()
            {
                AuthorId = message.AuthorId,
                DateOfSending = message.DateOfSending,
                DialogId = message.DialogId,
                IVBase64 = message.IVBase64,
                Text = message.Text,
                IsReaded = message.IsReaded
            };
        }
        #endregion

        #region Getting dialogs

        /// <summary>
        /// Returns user's dialogs
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="offset"></param>
        /// <param name="count"></param>
        /// <returns></returns>
        public async Task<List<DialogDTO>> GetDialogsAsync(long userId, int offset, int count)
        {
            List<DialogDTO> dialogs = new List<DialogDTO>();
            
            var userDialogs = await context.Dialogs
                .Where(d => d.DialogUsers.SingleOrDefault(du => du.UserId == userId) != null)
                .Include(d=>d.Messages)
                .Include(d => d.DialogUsers)
                .ThenInclude(du => du.User)
                .Skip(offset)
                .Take(count)
                .ToArrayAsync();

            foreach(var userDialog in userDialogs)
            {
                var interlocutor = userDialog.DialogUsers.Single(du => du.UserId != userId).User;
                var lastMessage = userDialog.Messages.Last();
                var dialog = new DialogDTO()
                {
                    IsClosed = userDialog.IsClosed,
                    Id = userDialog.Id,
                    EncryptedKey = userDialog.DialogUsers.Single(du => du.UserId == userId).UserEncryptedDialogKey,
                    InterlocutorId = interlocutor.Id,
                    InterlocutorImage = interlocutor.Image,
                    InterlocutorNickname = interlocutor.Nickname,
                    LastMessage = new MessageDTO()
                    {
                        Id = lastMessage.Id,
                        AuthorId = lastMessage.AuthorId,
                        DateOfSending = lastMessage.DateOfSending,
                        DialogId = lastMessage.DialogId,
                        IsReaded = lastMessage.IsReaded,
                        IVBase64 = lastMessage.IVBase64,
                        Text = lastMessage.Text
                    }
                };
                dialogs.Add(dialog);
            }

            return dialogs;
        }               

        /// <summary>
        /// Returns dialog between two users. If it doesn't exist it will be created
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="interlocutorId"></param>
        /// <returns></returns>
        public async Task<DialogDTO> GetDialogAsync(long userId, long interlocutorId)
        {
            DialogDTO dialogDTO = null;
            var dialogs = context.Dialogs
                .Where(d => d.DialogUsers.SingleOrDefault(du => du.UserId == userId) != null)
                .Include(d=>d.Messages)
                .Include(d => d.DialogUsers)
                .ThenInclude(du => du.User);

            var interlocutor = await context.Users.FindAsync(interlocutorId);
            var dialog = await dialogs.SingleOrDefaultAsync(d => d.DialogUsers.SingleOrDefault(du => du.User == interlocutor) != null);

            if(dialog == null)
            {
                dialog = await CreateDialogAsync(userId, interlocutorId);
            }           

            var lastMessage = dialog.Messages?.LastOrDefault();
            dialogDTO = new DialogDTO()
            {
                Id = dialog.Id,
                IsClosed = dialog.IsClosed,
                EncryptedKey = dialog.DialogUsers.Single(du => du.UserId == userId).UserEncryptedDialogKey,
                InterlocutorId = interlocutorId,
                InterlocutorImage = interlocutor.Image,
                InterlocutorNickname = interlocutor.Nickname,
                LastMessage = lastMessage!=null?ToMessageDTO(lastMessage):null
            };

            return dialogDTO;
        }
        #endregion
    }
}