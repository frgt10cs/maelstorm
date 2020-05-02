using Maelstorm.Dtos;
using System;

namespace Maelstorm.Entities
{
    public class DialogMessage
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public int TargetId { get; set; }
        public int DialogId { get; set; }
        public DateTime DateOfSending { get; set; }
        public byte Status { get; set; }
        public bool IsVisibleForAuthor { get; set; }
        public bool IsVisibleForOther { get; set; }
        public string Text { get; set; }
        public string IVBase64 { get; set; }
        public int ReplyId { get; set; }        

        public DialogMessage()
        {

        }

        public DialogMessage(MessageSendDTO model, int authorId, int dialogId)
        {
            AuthorId = authorId;
            DialogId = dialogId;
            TargetId = model.TargetId;
            DateOfSending = DateTime.Now;
            Text = model.Text;
            IVBase64 = model.IVBase64;
            ReplyId = model.ReplyId;            
            Status = 0;
            IsVisibleForAuthor = true;
            IsVisibleForOther = true;
        }               
    }
}
