import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeColors from "../data/colors";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CalcDate from "../hooks/CalcDate";
import Splash from "../components/Splash";

const MyChats = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
    chat: [styleSheet.chat, { backgroundColor: colors.bg2 }],
  };

  const windowHeight = Dimensions.get("window").height;
  const userStore = useSelector((state) => state.user);
  const me = userStore.user;
  const myDoc = firestore().collection("Users").doc(me.id);
  const [loading, setloading] = useState(true);

  const [myChats, setmyChats] = useState([]);

  const getMyChats = async () => {
    myDoc.onSnapshot((doc) => {
      setmyChats([]);
      let theArray = [];
      const keys = Object.keys(doc.data().chats);
      const values = Object.values(doc.data().chats);

      if (keys.length == 0) return;

      for (let i = 0; i < keys.length; i++) {
        theArray.push({ [keys[i]]: values[i] });
      }
      const waitUntilFetch = new Promise((resolve, reject) => {
        theArray.forEach(async (chat, index, array) => {
          const userEmail = Object.keys(chat)[0];
          const chatId = Object.values(chat)[0];
          const lastMessage = (
            await firestore()
              .collection("Chats")
              .doc(chatId)
              .collection("theChat")
              .orderBy("timestamp", "desc")
              .limit(1)
              .get()
          ).docs[0];
          if (lastMessage == undefined) {
            setmyChats([]);
            return;
          }
          const userInfo = (
            await firestore()
              .collection("Users")
              .where("email", "==", userEmail)
              .get()
          ).docs[0].data();
          setmyChats((prev) => [
            ...prev,
            {
              userInfo: userInfo,
              lastMessage: lastMessage.data(),
              chatId: chatId,
            },
          ]);
          if (index == array.length - 1) resolve();
        });
      });
      waitUntilFetch.then(setloading(false));
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await getMyChats();
    });

    return unsubscribe;
  }, [navigation]);

  const openChat = async (chatId, userInfo) => {
    const myInfo = (await myDoc.get()).data();
    navigation.push("chat", {
      chatId: chatId,
      me: myInfo,
      user: userInfo,
    });
  };

  return (
    <SafeAreaView style={styles.cont}>
      <Text style={[styles.text, { textAlign: "center", fontSize: 24 }]}>
        Chats
      </Text>
      {loading ? (
        <Splash />
      ) : (
        <FlatList
          data={myChats}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => openChat(item.chatId, item.userInfo)}
                activeOpacity={0.7}
                style={styles.chat}
              >
                <Image
                  source={{ uri: item.userInfo.photo }}
                  style={{
                    resizeMode: "contain",
                    width: 50,
                    height: 50,
                    borderRadius: 80,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.text, { fontSize: 20 }]}>
                    {item.userInfo.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={[
                          styles.text,
                          { fontSize: 18, opacity: 0.8, color: colors.third },
                        ]}
                      >
                        {item.lastMessage.sender == me.email ? "ben: " : ""}
                      </Text>
                      <Text
                        style={[styles.text, { fontSize: 18, opacity: 0.7 }]}
                      >
                        {item.lastMessage.text}
                      </Text>
                    </View>
                    <Text style={[styles.text, { fontSize: 18, opacity: 0.7 }]}>
                      {CalcDate(item.lastMessage.timestamp)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                marginTop: windowHeight / 3,
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="format-float-none"
                style={[
                  styles.text,
                  { color: colors.third, fontSize: 80, marginBottom: 12 },
                ]}
              />
              <Text
                style={[styles.text, { color: colors.third, fontSize: 20 }]}
              >
                Nothing to see here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyChats;

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
    padding: 12,
  },
  text: {
    fontFamily: "Raleway_300Light",
    fontSize: 16,
  },
  chat: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
  },
});
