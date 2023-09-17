import { StyleSheet, Text } from "react-native";
import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { FontAwesome } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setUser } from "../storee/userSlice";
import { useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import "react-native-gesture-handler";
import "react-native-safe-area-context";
import useThemeColors from "../data/colors";
import { Dimensions } from "react-native";
import { Image } from "react-native";
import bookGif from "../assets/logingif.gif";
import registerForPushNotificationsAsync from "../hooks/registerForPushNotificationsAsync";

const Login = () => {
  const windowWidth = Dimensions.get("window").width;

  const colors = useThemeColors();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  GoogleSignin.configure({
    webClientId:
      "454526784460-bbg4t2kn2d9mh7qlgmebmeifh2o4ugoe.apps.googleusercontent.com",
  });
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const returnObject = auth().signInWithCredential(googleCredential);

    const theUser = (await GoogleSignin.getCurrentUser()).user;

    dispatch(setUser(theUser));

    const userData = firestore().collection("Users").doc(theUser.id);

    if (!(await userData.get()).exists) {
      const notifToken = await registerForPushNotificationsAsync();
      await userData.set({
        name: theUser.name,
        email: theUser.email,
        photo: theUser.photo,
        id: theUser.id,
        friends: { follows: [], followers: [] },
        bookmarks: [],
        chats: {},
        notifToken: String(notifToken.data),
      });
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "tabGroup" }],
    });

    return returnObject;
  }

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    button: styleSheet.button,
    icon: styleSheet.icon,
    text: [styleSheet.text, { color: colors.text }],
    image: [styleSheet.image, { width: windowWidth - 40 }],
  };
  return (
    <SafeAreaView style={styles.cont}>
      <Image source={bookGif} style={styles.image} />
      <Text
        style={[
          styles.text,
          {
            marginBottom: 32,
            fontSize: 44,
            fontFamily: "Raleway_200ExtraLight",
          },
        ]}
      >
        Book Mook
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          onGoogleButtonPress().catch((error) => console.log(error))
        }
        activeOpacity={0.7}
      >
        <FontAwesome name="google" style={styles.icon} />
        <Text style={styles.text}>Sign-In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Login;

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 20,
    backgroundColor: "#4285F4",
    flexDirection: "row",
    borderRadius: 16,
    paddingHorizontal: 80,
    alignItems: "center",
  },
  icon: {
    color: "#fff",
    fontSize: 32,
    alignItems: "center",
    paddingRight: 20,
  },
  text: {
    fontFamily: "Raleway_400Regular",
    fontSize: 20,
    textAlign: "center",
  },
  image: { resizeMode: "contain", height: 400 },
});
