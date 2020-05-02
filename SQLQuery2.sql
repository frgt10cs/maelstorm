------select Users.id as InterlocutorId,users.Image as Image, Dialogs.Id as DialogId, m.Id as MessageId, m.Text, m.DateOfSending from Dialogs inner join
------(select DialogMessages.Id, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text
------from DialogMessages inner join
------(select DialogId, max(DateOfSending) as DateOfSending from DialogMessages
------where (DialogMessages.AuthorId=4 and DialogMessages.IsVisibleForAuthor=1)
------or (DialogMessages.AuthorId!=4 and DialogMessages.IsVisibleForOther=1) group by DialogId) x
------on DialogMessages.DateOfSending = x.DateOfSending and DialogMessages.DialogId = x.DialogId) as m
------on Dialogs.id = m.DialogId
------inner join Users on
------(Dialogs.FirstUserId = 4 and Users.id = Dialogs.SecondUserId)
------or (Dialogs.SecondUserId = 4 and Users.id = Dialogs.FirstUserId)
------where dialogs.id = 1

--select d.Id as Id, u.Id as InterlocutorId, u.Image as Image, u.Nickname as Title,  m.Text as LastMessageText, m.DateOfSending as LastMessageDate from (select * from Dialogs where id = 4) as d left join 
--(select DialogMessages.Id, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text
--from DialogMessages inner join
--(select DialogId, max(DateOfSending) as DateOfSending from DialogMessages
--where DialogId = 4 group by DialogId) x
--on DialogMessages.DateOfSending = x.DateOfSending and DialogMessages.DialogId = 4) as m
--on d.id = m.DialogId
--inner join (select* from users where id = 2) u on d.SecondUserId = u.Id or d.FirstUserId = u.Id


----select * from dialogs


------select DialogMessages.Id, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text
------from DialogMessages inner join
------(select DialogId, max(DateOfSending) as DateOfSending from DialogMessages
------where (DialogMessages.AuthorId=4 and DialogMessages.IsVisibleForAuthor=1)
------or (DialogMessages.AuthorId!=4 and DialogMessages.IsVisibleForOther=1) group by DialogId) m
------on DialogMessages.DateOfSending = m.DateOfSending and DialogMessages.DialogId = m.DialogId



------insert into DialogMessages (AuthorId, TargetId, DialogId, DateOfSending, Status, IsVisibleForAuthor, IsVisibleForOther, Text, ReplyId) 
------values (14,4,2,GETDATE(), 1, 1,1,'8',0)

------delete from dialogmessages;
----declare @userId int  =1;
----declare @dialogId int = 1;
----declare @offsetCount int = 0;
----declare @count int = 10;

----select Dialogs.Id as DialogId, Users.id as InterlocutorId, Users.Image as Image, Users.Nickname, m.Text, m.DateOfSending 
----                    from Dialogs inner join 
----                    (select DialogMessages.Id, DialogMessages.DialogId, DialogMessages.DateOfSending, DialogMessages.Text 
----                    from DialogMessages inner join 
----                    (select DialogId, max(DateOfSending) as DateOfSending from DialogMessages 
----                    where (DialogMessages.AuthorId = @userId and DialogMessages.IsVisibleForAuthor = 1)
----                    or(DialogMessages.AuthorId != @userId and DialogMessages.IsVisibleForOther = 1) group by DialogId) x
----                    on DialogMessages.DateOfSending = x.DateOfSending and DialogMessages.DialogId = x.DialogId) as m 
----                    on Dialogs.id = m.DialogId
----                    inner join Users on 
----                    (case when Dialogs.FirstUserId = @userId then Dialogs.SecondUserId
----                    when Dialogs.SecondUserId = @userId  then  Dialogs.FirstUserId end) = users.Id                    
----                    order by m.DateOfSending 
----                    offset @offsetCount rows 
----                    fetch next @count rows only        
delete from dialogs