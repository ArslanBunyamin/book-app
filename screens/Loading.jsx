import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { setUser } from "../storee/userSlice";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import "react-native-safe-area-context";
import useThemeColors from "../data/colors";
// import { StackActions, NavigationActions } from 'react-navigation';

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
      navigation.navigate("login");
    } else {
      const getUser = await GoogleSignin.getCurrentUser();
      const currentUser = getUser.user;
      dispatch(setUser(currentUser));
      navigation.navigate("tabGroup");
      // const resetAction = StackActions.reset({
      //   index: 0,
      //   actions: [NavigationActions.navigate({ routeName: "library" })],
      // });
      // this.props.navigation.dispatch(resetAction);
    }
  };
  useEffect(() => {
    isSignedIn();
  }, []);

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
  };
  return (
    <SafeAreaView style={styles.cont}>
      <Text style={styles.text}>Loading...</Text>
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
  text: {
    fontFamily: "Raleway_300Light",
    fontSize: 32,
  },
});
