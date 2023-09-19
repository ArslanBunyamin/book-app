import { Dimensions, StyleSheet, Text, View } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { setUser } from "../storee/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import ScaledImg from "../components/ScaledImg";
import { MaterialIcons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import "react-native-gesture-handler";
import "react-native-safe-area-context";
import useThemeColors from "../data/colors";

const MyProfile = ({ navigation }) => {
  const colors = useThemeColors();
  GoogleSignin.configure({
    webClientId:
      "454526784460-bbg4t2kn2d9mh7qlgmebmeifh2o4ugoe.apps.googleusercontent.com",
  });
  const dispatch = useDispatch();
  const signOut = async () => {
    GoogleSignin.signOut()
      .then(dispatch(setUser({})))
      .then(navigation.navigate("login"));
  };
  const windowWidth = Dimensions.get("window").width;
  const user = useSelector((state) => state.user).user;

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    profileCont: [styleSheet.profileCont, { backgroundColor: colors.fourth }],
    imgCont: styleSheet.imgCont,
    infoCont: styleSheet.infoCont,
    pp: styleSheet.pp,
    name: styleSheet.name,
    email: styleSheet.email,
    text: [styleSheet.text, { color: colors.text }],
    button: [styleSheet.button, { backgroundColor: colors.fifth }],
  };

  return (
    <SafeAreaView style={styles.cont}>
      <View style={styles.profileCont}>
        <View style={[styles.imgCont, { width: windowWidth / 3 }]}>
          {"photo" in user ? (
            <ScaledImg
              style={styles.pp}
              uri={user.photo}
              desiredWidth={windowWidth / 3}
            />
          ) : (
            ""
          )}
        </View>
        <View style={styles.infoCont}>
          <Text style={[styles.text, styles.name]}>{user.name}</Text>
          <View style={{ flexDirection: "row" }}>
            <MaterialIcons
              name="alternate-email"
              style={[styles.text, styles.email, { verticalAlign: "bottom" }]}
            />
            <Text style={[styles.text, styles.email]}>
              {user.email?.replace("@gmail.com", "")}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "48%" }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.text}>Edit Profile </Text>
            <FontAwesome5 name="user-edit" style={styles.text} />
          </TouchableOpacity>
        </View>
        <View style={{ width: "48%" }}>
          <TouchableOpacity
            style={styles.button}
            onPress={signOut}
            activeOpacity={0.7}
          >
            <Text style={styles.text}>Sign Out </Text>
            <FontAwesome name="sign-out" style={styles.text} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MyProfile;

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
    padding: 12,
  },
  profileCont: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
  },
  imgCont: {
    borderRadius: 50,
    overflow: "hidden",
  },
  infoCont: {
    padding: 12,
  },
  pp: {
    resizeMode: "cover",
  },
  name: {
    fontSize: 24,
    fontFamily: "Raleway_500Medium",
  },
  email: {
    fontSize: 16,
  },
  text: {
    fontFamily: "Raleway_300Light",
    fontSize: 24,
  },
  button: {
    padding: 20,
    marginVertical: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
