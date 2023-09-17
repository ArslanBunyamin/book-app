export default sendNotif = async (
  userToken,
  title,
  body,
  myInfoForNavigateToChat,
  userInfoForNavigateToChat,
  chatId
) => {
  const message = {
    to: userToken,
    sound: "default",
    title: title,
    body: body,
    data: {
      myInfo: userInfoForNavigateToChat,
      senderInfo: myInfoForNavigateToChat,
      chatId: chatId,
    },
    collapseKey: "green",
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  }).then(async (e) => console.log(await e.json()));
};
