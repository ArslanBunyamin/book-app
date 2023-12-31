export default sendNotif = async (
  userToken,
  title,
  body,
  me = "",
  user = "",
  chatId = ""
) => {
  const message = {
    to: userToken,
    sound: "default",
    title: title,
    body: body,
    data: {
      me: user,
      user: me,
      chatId: chatId,
    },
    tag: "STRING_TO_GROUP_NOTIFICATIONS_BY",
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};
