export default sendNotif = async (userToken, title, body, routeParameter) => {
  const message = {
    to: userToken,
    sound: "default",
    title: title,
    body: body,
    data: {
      routeParameter: routeParameter,
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
  });
};
