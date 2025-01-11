import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Entypo,
  FontAwesome,
  AntDesign,
  Ionicons,
  Octicons,
} from "@expo/vector-icons";
import useThemeColors from "../data/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useEffect, useRef, useState } from "react";
import {
  FlatList,
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import firestore from "@react-native-firebase/firestore";
import sendNotif from "../hooks/sendNotif";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import storage from "@react-native-firebase/storage";
import * as ScreenOrientation from "expo-screen-orientation";

const ListItem = memo(({ item, me, user, chatCollection, replyMessage }) => {
  const [modalVisible, setmodalVisible] = useState(false);
  const [modalImg, setmodalImg] = useState("");

  const colors = useThemeColors();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const styles = {
    text: [styleSheet.text, { color: colors.text }],
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

  const DoubleTapButton = ({ onDoubleTap, children }) => {
    const onHandlerStateChange = ({ nativeEvent }) => {
      if (nativeEvent.state === State.ACTIVE) {
        onDoubleTap && onDoubleTap();
      }
    };

    return (
      <TapGestureHandler
        onHandlerStateChange={onHandlerStateChange}
        numberOfTaps={2}
      >
        {children}
      </TapGestureHandler>
    );
  };

  const messageLiked = (messageId, liker) => {
    let newLiker = "";
    if (liker == "") newLiker = me.id;
    else if (liker == me.id) newLiker = "";
    else return;

    chatCollection.doc(messageId).update({
      liker: newLiker,
    });
  };

  const theMessage = item.data();
  const isItMe = theMessage.sender == me.id;
  const senderInfo = isItMe ? me : user;

  const swiped = useSharedValue({ id: -1, dx: 0 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: swiped.value.id == theMessage.id ? swiped.value.dx : 0 },
    ],
  }));

  const onswipe = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: (e) => {
      let theDx =
        typeof swiped.value.dx == typeof 3
          ? swiped.value.dx
          : swiped.value.dx.toValue;
      if (theDx >= 0 && e.translationX > 0 && theDx < 160) {
        if (e.translationX > 40)
          runOnJS(replyMessage)(theMessage.text, theMessage.sender);

        swiped.value = { id: theMessage.id, dx: e.translationX };
      }
    },
    onEnd: (e) => {
      swiped.value = { id: theMessage.id, dx: withSpring(0) };
    },
  });

  useEffect(() => {
    const rotateScreen = async (event) => {
      await ScreenOrientation.lockAsync(event.orientationInfo.orientation);
    };

    const subscription = ScreenOrientation.addOrientationChangeListener(
      (event) => {
        rotateScreen(event);
      }
    );

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={onswipe} minDist={30}>
        <Animated.View
          style={[
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
            <View style={{ width: 28, marginHorizontal: 4 }} />
          ) : (
            <TouchableOpacity
              onPress={() => {
                navigation.push("profile", { user: senderInfo });
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: senderInfo.photo }}
                style={{
                  resizeMode: "contain",
                  width: 28,
                  height: 28,
                  marginHorizontal: 4,
                  borderRadius: 200,
                  display: theMessage.continous ? "none" : "flex",
                }}
              />
            </TouchableOpacity>
          )}
          <Animated.View style={[animatedStyle, { maxWidth: "64%" }]}>
            {theMessage.replyingTo?.message == "" ? (
              ""
            ) : (
              <View
                style={{
                  backgroundColor: isItMe
                    ? colors.third + "77"
                    : colors.bg3 + "77",
                  alignSelf: isItMe ? "flex-end" : "flex-start",
                  paddingVertical: 4,
                  marginVertical: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 4,
                  paddingHorizontal: 8,
                }}
              >
                <View>
                  <Text
                    style={[
                      styles.text,
                      {
                        fontFamily: "Raleway_700Bold",
                        fontSize: 13,
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    {theMessage.replyingTo.sender}
                  </Text>
                  <Text style={styles.text}>
                    {" "}
                    {theMessage.replyingTo.message}
                  </Text>
                </View>
              </View>
            )}
            <DoubleTapButton
              onDoubleTap={async () => {
                messageLiked(theMessage.id, theMessage.liker);
              }}
            >
              <View
                style={{
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
                }}
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
            </DoubleTapButton>
            {theMessage.liker != "" ? (
              <AntDesign
                name="heart"
                style={{
                  fontSize: 16,
                  color: colors.first,
                  alignSelf: isItMe ? "flex-end" : "flex-start",
                }}
              />
            ) : (
              ""
            )}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
});

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
  const [lastMessageTimeStamp, setlastMessageTimeStamp] = useState(undefined);
  const [didMount, setdidMount] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const chatCollection = firestore()
    .collection("Chats")
    .doc(chatId)
    .collection("theChat");

  const fetchMessages = () => {
    chatCollection
      .orderBy("timestamp", "desc")
      .limit(20)
      .onSnapshot((query) => {
        setmessages(query.docs);
      });
  };

  const fetch30moreBooks = async () => {
    const newMessages = await chatCollection
      .orderBy("timestamp", "desc")
      .limit(30)
      .startAfter(lastMessageTimeStamp)
      .get();

    setmessages((prev) => prev.concat(newMessages.docs));
    setisLoading(false);
  };

  useEffect(() => {
    if (didMount && isLoading) fetch30moreBooks();
  }, [lastMessageTimeStamp]);

  useEffect(() => {
    fetchMessages();
    setdidMount(true);
  }, []);

  const sendMessage = () => {
    if (inputValue.trim() == "") return;
    const tempMessage = inputValue.trim();
    setinputValue("");

    let continous = false;
    if (messages.length != 0) {
      if (messages[0].data().sender == me.id) {
        continous = true;
      } else {
        chatCollection.doc(messages[0].data().id).update({
          lastMessageOfStreak: true,
        });
      }
    }
    const randomId = firestore().collection("x").doc().id;
    const time = new Date().toLocaleTimeString("tr-TR");
    const timestamp = firestore.FieldValue.serverTimestamp();
    chatCollection.doc(randomId).set({
      text: tempMessage,
      sender: me.id,
      id: randomId,
      timestamp: timestamp,
      time: time.substring(0, time.length - 3),
      continous: continous,
      lastMessageOfStreak: false,
      liker: "",
      replyingTo: replyingTo,
    });

    sendNotif(
      user.notifToken,
      me.name,
      inputValue.trim(),
      JSON.stringify(route.params)
    );
    setreplyingTo({ message: "", sender: "" });
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    const randomId = firestore().collection("x").doc().id;
    const reference = storage().ref(randomId);
    const pathToFile = result.assets[0].uri;

    await reference.putFile(pathToFile);

    if (!result.canceled) {
      const time = new Date().toLocaleTimeString("tr-TR");
      const timestamp = firestore.FieldValue.serverTimestamp();
      let continous = false;

      if (messages[0].data().sender == me.id) {
        continous = true;
      } else {
        chatCollection.doc(messages[0].data().id).update({
          lastMessageOfStreak: true,
        });
      }

      chatCollection.doc(randomId).set({
        text: "",
        image: await reference.getDownloadURL(),
        sender: me.id,
        id: randomId,
        timestamp: timestamp,
        time: time.substring(0, time.length - 3),
        continous: continous,
        lastMessageOfStreak: false,
        liker: "",
        replyingTo: replyingTo,
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
      quality: 0.7,
    });

    const randomId = firestore().collection("x").doc().id;
    const reference = storage().ref(randomId);
    const pathToFile = result.assets[0].uri;

    await reference.putFile(pathToFile);

    if (!result.canceled) {
      const time = new Date().toLocaleTimeString("tr-TR");
      const timestamp = firestore.FieldValue.serverTimestamp();
      let continous = false;

      if (messages[0].data().sender == me.id) {
        continous = true;
      } else {
        chatCollection.doc(messages[0].data().id).update({
          lastMessageOfStreak: true,
        });
      }

      chatCollection.doc(randomId).set({
        text: "",
        image: await reference.getDownloadURL(),
        sender: me.id,
        id: randomId,
        timestamp: timestamp,
        time: time.substring(0, time.length - 3),
        continous: continous,
        lastMessageOfStreak: false,
        liker: "",
        replyingTo: replyingTo,
      });

      sendNotif(
        user.notifToken,
        me.name,
        "🖼️ Image",
        JSON.stringify(me),
        JSON.stringify(user),
        JSON.stringify(chatId)
      );
    }
  };

  const [replyingTo, setreplyingTo] = useState({ message: "", sender: "" });

  const replyMessage = async (msg, sender) => {
    if (msg != replyingTo.message) {
      const username = await (
        await firestore().collection("Users").doc(sender).get()
      ).data().name;
      setreplyingTo({ message: msg, sender: username });
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
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.first} />
        ) : (
          ""
        )}
        <FlatList
          // onEndReached={() => {
          //   if (didMount) {
          //     setisLoading(true);
          //     setlastMessageTimeStamp(
          //       messages[messages.length - 1]?.data().timestamp
          //     );
          //   }
          // }}
          removeClippedSubviews={true}
          inverted={true}
          data={messages}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              me={me}
              user={user}
              chatCollection={chatCollection}
              replyMessage={replyMessage}
            />
          )}
          keyExtractor={(item) => item.id}
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 0,
          }}
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
          initialNumToRender={30}
        />
      </View>
      {replyingTo.message == "" ? (
        ""
      ) : (
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.bg3,
            alignItems: "center",
            borderRadius: 4,
            paddingVertical: 8,
            marginHorizontal: 12,
            opacity: 0.8,
          }}
        >
          <Octicons
            name="reply"
            style={{
              fontSize: 20,
              color: colors.third,
              paddingHorizontal: 12,
            }}
          />
          <View style={{ flexGrow: 1 }}>
            <Text style={{ color: colors.third }}>{replyingTo?.sender}</Text>
            <Text style={[styles.text, {}]}>
              {replyingTo.message.length > 40
                ? replyingTo.message.split("", 43).join("") + "..."
                : replyingTo.message}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setreplyingTo({ message: "", sender: "" });
            }}
            activeOpacity={0.7}
            style={{
              alignSelf: "stretch",
              justifyContent: "center",
              paddingHorizontal: 12,
            }}
          >
            <AntDesign
              name="close"
              style={{
                color: colors.third,
                fontSize: 20,
              }}
            />
          </TouchableOpacity>
        </View>
      )}
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
              if (messages.length != 0)
                flatListRef.current.scrollToIndex({ index: 0 });
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
    padding: 16,
  },
  main: { flex: 1, paddingBottom: 4 },
  textInput: {
    padding: 8,
    flex: 1,
    fontSize: 16,
    maxHeight: 40,
  },
  messageBox: { alignItems: "flex-start" },
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
