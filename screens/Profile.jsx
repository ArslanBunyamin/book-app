import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScaledImg from "../components/ScaledImg";
import { MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { FlatList } from "react-native-gesture-handler";
import useThemeColors from "../data/colors";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import splitTen from "../hooks/splitTen";
import Splash from "../components/Splash";

const Profile = ({ route, navigation }) => {
  const userInfo = route.params?.user;
  const colors = useThemeColors();
  const windowWidth = Dimensions.get("window").width;
  const userStore = useSelector((state) => state.user);
  const me = userStore.user;

  const myDoc = firestore().collection("Users").doc(me.id);
  const userDoc = firestore().collection("Users").doc(userInfo.id);
  const [myFriends, setmyFriends] = useState({});
  const [following, setfollowing] = useState(false);
  const [user, setuser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setmodalData] = useState([]);
  const [loading, setloading] = useState(true);
  const [modalWhich, setmodalWhich] = useState("");

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    topnav: [styleSheet.topnav, { backgroundColor: colors.bg }],
    profileCont: [styleSheet.profileCont, { backgroundColor: colors.bg3 }],
    imgCont: styleSheet.imgCont,
    infoCont: styleSheet.infoCont,
    pp: styleSheet.pp,
    name: styleSheet.name,
    email: [styleSheet.email],
    text: [styleSheet.text, { color: colors.text }],
    infoText: [styleSheet.infoText, { color: colors.text }],
    button: [styleSheet.button, { backgroundColor: colors.bg2 }],
    modalCont: [styleSheet.modalCont, { backgroundColor: colors.bg2 }],
  };

  const getAndSetFriends = async () => {
    const myFriends = (await myDoc.get()).data().friends;
    setmyFriends(myFriends);
  };

  const getUser = async () => {
    const user = await userDoc.get();
    setuser(user.data());
  };

  const addFriend = async () => {
    const myInfo = (await myDoc.get()).data();
    const userInfo = (await userDoc.get()).data();
    if (following) {
      setfollowing(false);
      await myDoc.update({
        friends: {
          follows: firestore.FieldValue.arrayRemove(userInfo.email),
          followers: myInfo.friends.followers,
        },
      });
      await userDoc.update({
        friends: {
          follows: userInfo.friends.follows,
          followers: firestore.FieldValue.arrayRemove(myInfo.email),
        },
      });
    } else {
      setfollowing(true);
      await myDoc.update({
        friends: {
          follows: firestore.FieldValue.arrayUnion(userInfo.email),
          followers: myInfo.friends.followers,
        },
      });
      await userDoc.update({
        friends: {
          follows: userInfo.friends.follows,
          followers: firestore.FieldValue.arrayUnion(myInfo.email),
        },
      });
    }
    getUser();
  };

  useEffect(() => {
    if (user != undefined) setloading(false);
  }, [user]);

  const openModal = async (list, infoName) => {
    if (list == undefined) return;
    if (list.length == 0) return;
    setmodalData([]);

    const splittedList = splitTen(list);
    const waitUntilFetch = new Promise((resolve, reject) => {
      splittedList.forEach(async (list, index, array) => {
        let dataPiece;
        if (infoName == "follows" || infoName == "followers") {
          dataPiece = (
            await firestore()
              .collection("Users")
              .where("email", "in", list)
              .get()
          ).docs;
          setmodalData((prev) => prev.concat(dataPiece));
        } else if (infoName == "bookmarks") {
          dataPiece = (
            await firestore().collection("Books").where("id", "in", list).get()
          ).docs;
          setmodalData((prev) => prev.concat(dataPiece));
        }
        if (index == array.length - 1) resolve();
      });
    });
    waitUntilFetch.then(() => {});
  };
  useEffect(() => {
    if (modalData.length != 0) {
      setModalVisible(true);
    }
  }, [modalData]);

  useEffect(() => {
    if (myFriends?.follows?.includes(userInfo.email)) setfollowing(true);
  }, [myFriends]);

  useEffect(() => {
    getAndSetFriends();
    getUser();
  }, []);

  const FriendsModal = ({ item }) => {
    return (
      <View
        style={{
          margin: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: colors.bg3,
          borderRadius: 8,
          padding: 4,
          overflow: "hidden",
          flex: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.imgCont, { width: 56 }]}>
            <ScaledImg
              style={[styles.pp, { borderRadius: 100 }]}
              uri={item.data().photo}
              desiredWidth={56}
            />
          </View>

          <Text
            style={[styles.infoText, { fontSize: 16, marginHorizontal: 12 }]}
          >
            {item.data().name.length < 14
              ? item.data().name
              : item.data().name.split("").slice(0, 13).join("") + "..."}
          </Text>
        </View>
        <TouchableHighlight
          onPress={() => {
            setModalVisible(false);
            setmodalWhich("");
            navigation.push("profile", { user: item.data() });
          }}
          underlayColor={colors.third}
          style={{
            backgroundColor: colors.bg2,
            padding: 12,
            borderRadius: 8,
            justifyContent: "center",
            elevation: 2,
          }}
        >
          <Text style={[styles.infoText, { fontSize: 13, color: colors.text }]}>
            show profile
          </Text>
        </TouchableHighlight>
      </View>
    );
  };

  const BookmarksModal = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setModalVisible(false);
          setmodalWhich("");
          navigation.push("book", {
            book: item.data(),
            bookId: item.id,
          });
        }}
        activeOpacity={0.7}
        style={{
          margin: 4,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.bg3,
          borderRadius: 8,
          padding: 4,
          overflow: "hidden",
          flex: 1,
          elevation: 4,
        }}
      >
        <View style={[styles.imgCont, { width: 64, borderRadius: 8 }]}>
          <ScaledImg
            style={[styles.pp, {}]}
            uri={item.data().coverUrl}
            desiredWidth={64}
          />
        </View>

        <View
          style={{
            height: "100%",
            flex: 1,
            paddingHorizontal: 8,
          }}
        >
          <Text
            style={[
              styles.infoText,
              {
                fontSize: 20,
                flexWrap: "wrap",
              },
            ]}
          >
            {item.data().title}
          </Text>
          <Text style={[styles.infoText, { opacity: 0.7 }]}>
            {item.data().author}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (modalWhich == "followers" || modalWhich == "follows")
      openModal(user.friends[modalWhich], modalWhich);
    else if (modalWhich == "bookmarks") openModal(user.bookmarks, "bookmarks");
    else {
      setModalVisible(false);
    }
  }, [modalWhich]);

  const onChatPress = async () => {
    const myInfo = (await myDoc.get()).data();
    const userInfo = (await userDoc.get()).data();
    const myChats = myInfo.chats;
    const userChats = userInfo.chats;
    if (myChats[userInfo.email] == undefined) {
      const randomId = firestore().collection("x").doc().id;

      await myDoc.update({
        chats: { [userInfo.email]: randomId },
      });
      await userDoc.update({
        chats: { [myInfo.email]: randomId },
      });
    }
    navigation.push("chat", {
      chatId: myChats[userInfo.email],
      me: myInfo.email,
      user: userInfo.email,
    });
  };

  return (
    <SafeAreaView style={styles.cont}>
      {loading ? (
        <Splash />
      ) : (
        <View style={{ flex: 1 }}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              setmodalWhich("");
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={styles.modalCont}>
                <View style={{ flex: 1, width: 360 }}>
                  <FlatList
                    data={modalData}
                    renderItem={({ item }) => {
                      return modalWhich == "bookmarks" ? (
                        <BookmarksModal item={item} />
                      ) : modalWhich == "follows" ||
                        modalWhich == "followers" ? (
                        <FriendsModal item={item} />
                      ) : (
                        ""
                      );
                    }}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    numColumns={1}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "center",
                    position: "absolute",
                    bottom: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setmodalWhich("");
                    }}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: colors.bg3,
                      paddingVertical: 8,
                      paddingHorizontal: 20,
                      elevation: 5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.bg,
                    }}
                  >
                    <Text style={[styles.infoText, { color: colors.first }]}>
                      close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <View style={styles.topnav}>
            <TouchableOpacity
              style={styles.text}
              activeOpacity={0.7}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Entypo
                name="chevron-left"
                style={[styles.text, { fontSize: 32 }]}
              />
            </TouchableOpacity>
            <Text style={[styles.text, styles.name]}>{userInfo.name}</Text>
          </View>
          <View style={styles.profileCont}>
            <View style={[styles.imgCont, { width: windowWidth / 4 }]}>
              <ScaledImg
                style={[styles.pp, { borderRadius: 100 }]}
                uri={userInfo.photo}
                desiredWidth={windowWidth / 4}
              />
            </View>

            <View style={styles.infoCont}>
              <TouchableOpacity
                onPress={() => {
                  setmodalWhich("followers");
                }}
                style={{ alignItems: "center" }}
              >
                <Text style={styles.text}>
                  {user.friends == undefined
                    ? "0"
                    : user.friends.followers == undefined
                    ? "0"
                    : user.friends.followers.length}
                </Text>
                <Text style={styles.infoText}>followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setmodalWhich("follows");
                }}
                style={{ alignItems: "center" }}
              >
                <Text style={styles.text}>
                  {user.friends == undefined
                    ? "0"
                    : user.friends.follows == undefined
                    ? "0"
                    : user.friends.follows.length}
                </Text>
                <Text style={styles.infoText}>follows</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setmodalWhich("bookmarks");
                }}
                activeOpacity={0.7}
                style={{ alignItems: "center" }}
              >
                <Text style={styles.text}>
                  {user.bookmarks == undefined ? "0" : user.bookmarks.length}
                </Text>
                <Text style={styles.infoText}>bookmarks</Text>
              </TouchableOpacity>
            </View>
          </View>
          {me.email == user.email ? null : (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ width: "48.5%" }}>
                <TouchableOpacity
                  style={[styles.button, { alignItems: "center" }]}
                  onPress={onChatPress}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name="envelope-o"
                    style={[styles.text, { color: colors.third }]}
                  />
                  <Text style={[styles.text, { color: colors.third }]}>
                    {" "}
                    Message
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: "48.5%" }}>
                <TouchableOpacity
                  style={[styles.button, { alignItems: "center" }]}
                  onPress={addFriend}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={following ? "person-remove" : "person-add-alt"}
                    style={[styles.text, { fontSize: 32, color: colors.third }]}
                  />
                  <Text style={[styles.text, { color: colors.third }]}>
                    {following ? " unfollow" : " Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
    padding: 12,
  },
  topnav: {
    flexDirection: "row",
    paddingBottom: 20,
  },
  profileCont: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
  },
  imgCont: {
    overflow: "hidden",
  },
  infoCont: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  pp: {
    resizeMode: "contain",
  },
  infoText: {
    fontFamily: "Raleway_300Light",
    fontSize: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: "Raleway_500Medium",
    paddingLeft: 12,
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
    marginVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  modalCont: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: 600,
    width: 360,
    flex: 1,
    elevation: 20,
  },
  modalFriends: {
    flex: 1,
  },
});
