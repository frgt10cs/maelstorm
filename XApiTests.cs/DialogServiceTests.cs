using MaelstormDTO.Requests;
using MaelstormDTO.Responses;
using System.Linq;
using XApiTests.Fakes;
using Xunit;
using Xunit.Priority;

namespace XApiTests.cs
{
    [Collection("Fake context")]
    [TestCaseOrderer(PriorityOrderer.Name, PriorityOrderer.Assembly)]
    public class DialogServiceTests
    {
        private FakeServiceFactory fakeServiceFactory;       
        public DialogServiceTests(FakeContext context)
        {
            fakeServiceFactory = new FakeServiceFactory(context);            
        }

        [Fact, Priority(0)]
        public void GetDialogNotNull()
        {
            var dialogService = fakeServiceFactory.CreateDialogService();

            var dialog = dialogService.GetDialogAsync(1, 2).Result;

            Assert.NotNull(dialog);
        }

        [Fact, Priority(1)]
        public void SendMessageSuccessful()
        {
            var dialogService = fakeServiceFactory.CreateDialogService();
            var sendMessageRequest = new SendMessageRequest()
            {
                DialogId = 1,
                Text = "sesesese",
                IVBase64 = "112233445566"
            };

            var result = dialogService.SendDialogMessageAsync(sendMessageRequest, 1).Result;

            Assert.Equal(1, result.MessageId);
        }

        [Fact, Priority(2)]
        public void GetUnreadedMessageSuccessful()
        {
            var dialogService = fakeServiceFactory.CreateDialogService();

            var messages = dialogService.GetUnreadedMessagesAsync(1, 1, 0, 1).Result;

            Assert.NotNull(messages.First());
        }

        [Fact, Priority(3)]
        public void SetMessageAsReadedSuccessful()
        {
            var dialogService = fakeServiceFactory.CreateDialogService();

            dialogService.SetMessageAsReadedAsync(2, 1).Wait();
        }

        [Fact, Priority(4)]
        public void GetReadedMessageSuccessful()
        {
            var dialogService = fakeServiceFactory.CreateDialogService();

            var messages = dialogService.GetReadedMessagesAsync(1, 1, 0, 1).Result;

            Assert.NotNull(messages.First());
        }
    }
}
