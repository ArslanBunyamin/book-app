import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { setUser } from "../storee/userSlice";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import "react-native-safe-area-context";
import useThemeColors from "../data/colors";
import bookgif from "../assets/bookgif.gif";
import { Image } from "react-native";

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
      const getUser = await GoogleSignin.getCurrentUser();
      const currentUser = getUser.user;
      dispatch(setUser(currentUser));
      // navigation.navigate("tabGroup");

      navigation.reset({
        index: 0,
        routes: [{ name: "tabGroup" }],
      });
    }
  };
  useEffect(() => {
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
