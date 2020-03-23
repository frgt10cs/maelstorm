function AppendUserFound(data) {
    var box = document.createElement("div");
    box.classList.add("userPreviewInner");
    box.onclick = function() {        
        SendRequest(new MaelstormRequest("/api/user/getuserinfo?userId=" + data.userId, function(userInfo) {
            console.log(userInfo);
            userInfoAvatarBox.style.backgroundImage = "url('/images/" + userInfo.avatar + "')";
            userInfoNicknameBox.innerText = userInfo.nickname;
            userInfoStatusBox.innerText = userInfo.status;
            userInfoOnlineStatusBox.innerText = userInfo.onlineStatus ? "online" : "offline";
            dark.style.display = "block";
            userInfoPanel.style.display = "block";
            userInfoOpenDialog.onclick = () => {
                if (IsDialogUploaded(userInfo.id)) {
                    OpenDialog(userInfo.id);
                } else {
                    GetDialog(userInfo.id, (dialog) => {
                        if (dialog !== null && dialog !== undefined) {
                            AddDialog(dialog);
                            OpenDialog(userInfo.id);
                        } else {
                            var newDialog = {
                                interlocutorId: userInfo.id,
                                title: userInfo.nickname,
                                lastMessageText: "",
                                lastMessageDate: "",
                                image: userInfo.avatar
                            };
                            AddDialog(newDialog);
                            OpenDialog(userInfo.id);
                        }
                    });
                }
                dark.style.display = "none";
                userInfoPanel.style.display = "none";
            };
        }));
    };
    var imageBox = document.createElement("div");
    imageBox.style.backgroundImage = "url('/images/" + data.miniAvatar + "')";
    imageBox.classList.add("userPreviewAvatar");
    box.appendChild(imageBox);
    var nicknameBox = document.createElement("div");
    nicknameBox.textContent = data.nickname;
    nicknameBox.classList.add("userPreviewNickname");
    box.appendChild(nicknameBox);
    box.id = data.userId;
    userResultsInner.appendChild(box);
}