import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Entypo, FontAwesome, AntDesign } from "@expo/vector-icons";
import useThemeColors from "../data/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import firestore from "@react-native-firebase/firestore";

export default Chat = ({ route, navigation }) => {
  const chatId = route.params?.chatId;
  const me = route.params?.me;
  const user = route.params?.user;
  const windowHeight = Dimensions.get("window").height;

  const colors = useThemeColors();
  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
    topnav: [styleSheet.topnav, { backgroundColor: colors.bg }],
    main: [styleSheet.main, { backgroundColor: colors.bg }],
    textInput: [styleSheet.textInput, { color: colors.text }],
    myMessage: [
      styleSheet.messageBox,
      styleSheet.myMessage,
      { backgroundColor: colors.bg2 },
    ],
    userMessage: [
      styleSheet.messageBox,
      styleSheet.userMessage,
      { backgroundColor: colors.third },
    ],
  };

  const textInputRef = useRef(null);
  const flatListRef = useRef(null);
  const [inputValue, setinputValue] = useState("");
  const [messages, setmessages] = useState([]);

  const chatCollection = firestore()
    .collection("Chats")
    .doc(chatId)
    .collection("theChat");

  const fetchMessages = () => {
    chatCollection
      .orderBy("timestamp", "desc")
      .limit(40)
      .onSnapshot((query) => {
        setmessages([...query.docs.reverse().map((doc) => doc.data())]);
      });
  };

  const sendMessage = async () => {
    if (inputValue.trim() != "") {
      const randomId = firestore().collection("x").doc().id;
      chatCollection.doc(randomId).set({
        text: inputValue.trim(),
        sender: me,
        id: randomId,
        timestamp: new Date(),
      });
      setinputValue("");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <SafeAreaView style={styles.cont}>
      <View style={styles.topnav}>
        <TouchableOpacity
          style={styles.text}
          activeOpacity={0.7}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Entypo name="chevron-left" style={[styles.text, { fontSize: 32 }]} />
        </TouchableOpacity>
      </View>
      <View style={styles.main}>
        <FlatList
          data={messages}
          renderItem={({ item }) => {
            return (
              <View style={{ padding: 4 }}>
                <Text
                  style={[
                    styles.text,
                    item.sender == me
                      ? styles.myMessage
                      : item.sender == user
                      ? styles.userMessage
                      : "",
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          ref={flatListRef}
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
          backgroundColor: colors.bg3,
          alignItems: "center",
          borderRadius: 4,
          paddingHorizontal: 8,
        }}
      >
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Write a Comment..."
          placeholderTextColor={colors.bg}
          cursorColor={colors.bg}
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
    fontSize: 24,
  },
  topnav: {
    flexDirection: "row",
    paddingBottom: 20,
  },
  main: { flex: 1 },
  textInput: { padding: 8, flex: 1, fontSize: 16 },
  messageBox: {
    padding: 8,
    fontSize: 16,
    alignSelf: "flex-start",
    flexWrap: "wrap",
    maxWidth: "50%",
  },
  myMessage: { alignSelf: "flex-end" },
  userMessage: {},
});
