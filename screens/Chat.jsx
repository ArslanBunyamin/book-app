import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Entypo, FontAwesome, AntDesign, Ionicons } from "@expo/vector-icons";
import useThemeColors from "../data/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import firestore from "@react-native-firebase/firestore";
import sendNotif from "../hooks/sendNotif";
import * as ImagePicker from "expo-image-picker";

export default Chat = ({ route, navigation }) => {
  const parameters = route.params;
  const chatId = parameters.chatId;
  const me = parameters.me;
  const user = parameters.user;

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const colors = useThemeColors();
  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
    topnav: [styleSheet.topnav, { backgroundColor: colors.bg }],
    main: [styleSheet.main, { backgroundColor: colors.bg }],
    textInput: [styleSheet.textInput, { color: colors.text }],
    myMessage: [styleSheet.messageBox, styleSheet.myMessage],
    userMessage: [styleSheet.messageBox, styleSheet.userMessage],
    modalCont: [
      styleSheet.modalCont,
      {
        backgroundColor: colors.bg2,
        maxWidth: windowWidth - 20,
        maxHeight: windowHeight - 100,
        borderColor: colors.fifth,
      },
    ],
  };

  const textInputRef = useRef(null);
  const flatListRef = useRef(null);
  const [inputValue, setinputValue] = useState("");
  const [messages, setmessages] = useState([]);
  const [modalVisible, setmodalVisible] = useState(false);
  const [modalImg, setmodalImg] = useState("");

  const chatCollection = firestore()
    .collection("Chats")
    .doc(chatId)
    .collection("theChat");

  const fetchMessages = () => {
    chatCollection
      .orderBy("timestamp", "desc")
      .limit(40)
      .onSnapshot((query) => {
        setmessages(query.docs.reverse());
      });
  };

  const sendMessage = async () => {
    if (inputValue.trim() != "") {
      let continous = false;
      if (messages.length != 0) {
        if (messages[messages.length - 1].data().sender == me.id) {
          continous = true;
        } else {
          chatCollection.doc(messages[messages.length - 1].data().id).update({
            lastMessageOfStreak: true,
          });
        }
      }
      const randomId = firestore().collection("x").doc().id;
      const time = new Date().toLocaleTimeString("tr-TR");
      const timestamp = firestore.FieldValue.serverTimestamp();
      chatCollection.doc(randomId).set({
        text: inputValue.trim(),
        sender: me.id,
        id: randomId,
        timestamp: timestamp,
        time: time.substring(0, time.length - 3),
        continous: continous,
        lastMessageOfStreak: false,
      });
      setinputValue("");

      sendNotif(
        user.notifToken,
        me.name,
        inputValue.trim(),
        JSON.stringify(route.params)
      );
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
    });

    if (!result.canceled) {
      const randomId = firestore().collection("x").doc().id;
      const time = new Date().toLocaleTimeString("tr-TR");
      const timestamp = firestore.FieldValue.serverTimestamp();
      let continous = false;

      if (messages[messages.length - 1].data().sender == me.id) {
        continous = true;
      } else {
        chatCollection.doc(messages[messages.length - 1].data().id).update({
          lastMessageOfStreak: true,
        });
      }

      chatCollection.doc(randomId).set({
        image: result.assets[0].uri,
        sender: me.id,
        id: randomId,
        timestamp: timestamp,
        time: time.substring(0, time.length - 3),
        continous: continous,
        lastMessageOfStreak: false,
      });

      sendNotif(
        user.notifToken,
        me.name,
        "🖼️ Image",
        JSON.stringify(route.params)
      );
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });

    if (!result.canceled) {
      const randomId = firestore().collection("x").doc().id;
      const time = new Date().toLocaleTimeString("tr-TR");
      const timestamp = firestore.FieldValue.serverTimestamp();
      let continous = false;

      if (messages[messages.length - 1].data().sender == me.id) {
        continous = true;
      } else {
        chatCollection.doc(messages[messages.length - 1].data().id).update({
          lastMessageOfStreak: true,
        });
      }

      chatCollection.doc(randomId).set({
        image: result.assets[0].uri,
        sender: me.id,
        id: randomId,
        timestamp: timestamp,
        time: time.substring(0, time.length - 3),
        continous: continous,
        lastMessageOfStreak: false,
      });

      sendNotif(
        user.notifToken,
        me.name,
        "🖼️ Image",
        JSON.stringify(route.params)
      );
    }
  };

  return (
    <SafeAreaView style={styles.cont}>
      <View style={styles.topnav}>
        <TouchableOpacity
          style={[
            styles.text,
            { position: "absolute", left: 0, top: 0, padding: 12 },
          ]}
          activeOpacity={0.7}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Entypo name="chevron-left" style={[styles.text, { fontSize: 32 }]} />
        </TouchableOpacity>
        <Text
          style={[
            styles.text,
            { verticalAlign: "middle", color: colors.third, fontSize: 18 },
          ]}
        >
          {user.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            position: "absolute",
            right: 0,
            top: 0,
            padding: 8,
          }}
        >
          <TouchableOpacity onPress={() => openCamera()} activeOpacity={0.7}>
            <Ionicons
              name="camera"
              style={[
                styles.icon,
                {
                  fontSize: 30,
                  color: colors.second,
                },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage()} activeOpacity={0.7}>
            <Ionicons
              name="image"
              style={[
                styles.icon,
                {
                  fontSize: 30,
                  color: colors.second,
                  paddingLeft: 8,
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.main}>
        <FlatList
          data={messages}
          renderItem={({ item }) => {
            const theMessage = item.data();
            const isItMe = theMessage.sender == me.id;
            const senderInfo = isItMe ? me : user;
            return (
              <View
                style={[
                  styles.text,
                  isItMe ? styles.myMessage : styles.userMessage,
                  { paddingTop: theMessage.continous ? 2 : 8 },
                ]}
              >
                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    setmodalVisible(false);
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setmodalVisible(false)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.modalCont}>
                      <ScaledImg
                        style={{ resizeMode: "contain", aspectRatio: 1 }}
                        uri={modalImg}
                        desiredWidth={windowWidth - 20}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
                {theMessage.continous ? (
                  <View style={{ width: 32, marginHorizontal: 4 }} />
                ) : (
                  <Image
                    source={{ uri: senderInfo.photo }}
                    style={{
                      resizeMode: "contain",
                      width: 32,
                      height: 32,
                      marginHorizontal: 4,
                      borderRadius: 200,
                      display: theMessage.continous ? "none" : "flex",
                    }}
                  />
                )}
                <View style={{ maxWidth: "64%" }}>
                  <View
                    style={[
                      {
                        backgroundColor: isItMe ? colors.bg3 : colors.third,
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        flexDirection: "row",
                        flexWrap: "wrap",
                        borderRadius: 8,
                        overflow: "hidden",
                        borderBottomRightRadius: !isItMe
                          ? 8
                          : !theMessage.continous
                          ? theMessage.lastMessageOfStreak
                            ? 8
                            : 0
                          : theMessage.lastMessageOfStreak
                          ? 8
                          : 0,

                        borderTopRightRadius: !isItMe
                          ? 8
                          : !theMessage.continous
                          ? 8
                          : 0,

                        borderBottomLeftRadius: isItMe
                          ? 8
                          : !theMessage.continous
                          ? theMessage.lastMessageOfStreak
                            ? 8
                            : 0
                          : theMessage.lastMessageOfStreak
                          ? 8
                          : 0,
                        borderTopLeftRadius: isItMe
                          ? 8
                          : !theMessage.continous
                          ? 8
                          : 0,
                      },
                    ]}
                  >
                    {theMessage.image == undefined ? (
                      <Text
                        style={[
                          styles.text,
                          {
                            flexWrap: "wrap",
                            color: isItMe ? colors.text : "#eee",
                          },
                        ]}
                      >
                        {theMessage.text}
                      </Text>
                    ) : (
                      theMessage.image && (
                        <TouchableOpacity
                          onPress={() => {
                            setmodalImg(theMessage.image);
                            setmodalVisible(true);
                          }}
                          activeOpacity={0.7}
                          style={{ width: "100%", marginBottom: 4 }}
                        >
                          <Image
                            source={{ uri: theMessage.image }}
                            style={{
                              width: "100%",
                              aspectRatio: 1,
                              resizeMode: "cover",
                            }}
                          />
                        </TouchableOpacity>
                      )
                    )}
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 11,
                          opacity: 0.7,
                          marginLeft: 8,
                          alignSelf: "flex-end",
                          flexGrow: 1,
                          textAlign: "right",
                          minWidth: 30,
                          color: isItMe ? colors.text : "#eee",
                        },
                      ]}
                    >
                      {theMessage.time}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current.scrollToEnd()}
          ListEmptyComponent={
            <View
              style={{
                marginTop: windowHeight / 3,
                alignItems: "center",
              }}
            >
              <AntDesign
                name="smile-circle"
                style={[
                  styles.text,
                  { color: colors.third, fontSize: 64, marginBottom: 12 },
                ]}
              />
              <Text style={[styles.text, { color: colors.third }]}>
                Send a Message
              </Text>
            </View>
          }
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "transparent",
          alignItems: "center",
          borderRadius: 4,
          paddingHorizontal: 8,
        }}
      >
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Write a Message..."
          placeholderTextColor={colors.placeholder}
          cursorColor={colors.second}
          multiline={true}
          selectionColor={colors.first}
          onEndEditing={() => {}}
          onChangeText={(e) => setinputValue(e)}
          value={inputValue}
          clearTextOnFocus={false}
          onFocus={() =>
            setTimeout(() => {
              flatListRef.current.scrollToEnd();
            }, 500)
          }
        />

        <TouchableOpacity
          onPress={() => {
            sendMessage();
          }}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="send"
            style={[
              styles.icon,
              {
                fontSize: 24,
                padding: 8,
                color: colors.second,
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
  },
  text: {
    fontFamily: "Raleway_500Medium",
    fontSize: 15,
  },
  topnav: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
  },
  main: { flex: 1, paddingBottom: 4 },
  textInput: {
    padding: 8,
    flex: 1,
    fontSize: 16,
  },
  messageBox: { alignItems: "flex-end" },
  myMessage: { flexDirection: "row-reverse" },
  userMessage: { flexDirection: "row" },
  modalCont: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
});
