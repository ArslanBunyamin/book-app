import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { setUser } from "../storee/userSlice";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import "react-native-safe-area-context";
import useThemeColors from "../data/colors";
import bookgif from "../assets/bookgif.gif";
import { Image } from "react-native";
import * as Notifications from "expo-notifications";
import registerForPushNotificationsAsync from "../hooks/registerForPushNotificationsAsync";
import * as TaskManager from "expo-task-manager";

export default Loading = ({ navigation }) => {
  const colors = useThemeColors();
  GoogleSignin.configure({
    webClientId:
      "454526784460-bbg4t2kn2d9mh7qlgmebmeifh2o4ugoe.apps.googleusercontent.com",
  });
  const dispatch = useDispatch();

  const isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!isSignedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: "login" }],
      });
    } else {
      const currentUser = (await GoogleSignin.getCurrentUser()).user;
      dispatch(setUser(currentUser));

      // await registerForPushNotificationsAsync(currentUser.id);

      navigation.reset({
        index: 0,
        routes: [{ name: "tabGroup" }],
      });
    }
  };

  useEffect(() => {
    const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data }) => {
      const parsedData = JSON.parse(data.notification.data.body);
      setTimeout(() => {
        navigation.navigate("chat", {
          chatId: parsedData.chatId,
          me: parsedData.myInfo,
          user: parsedData.senderInfo,
        });
      }, 3000);
    });

    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

    isSignedIn();
  }, []);

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    image: styleSheet.image,
  };
  return (
    <SafeAreaView style={styles.cont}>
      <View style={styles.loading}>
        <Image source={bookgif} />
      </View>
    </SafeAreaView>
  );
};
const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 600,
    justifyContent: "center",
  },
});
