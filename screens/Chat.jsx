import {
  Dimensions,
  Image,
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
import { toDateTime } from "../hooks/CalcDate";

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
    myMessage: [styleSheet.messageBox, styleSheet.myMessage],
    userMessage: [styleSheet.messageBox, styleSheet.userMessage],
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
      let continous = false;
      if (messages.length != 0)
        continous = messages[messages.length - 1].sender == me.email;
      const randomId = firestore().collection("x").doc().id;
      chatCollection.doc(randomId).set({
        text: inputValue.trim(),
        sender: me.email,
        id: randomId,
        timestamp: firestore.Timestamp.now(),
        continous: continous,
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
          style={[styles.text, { position: "absolute", left: 0 }]}
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
      </View>
      <View style={styles.main}>
        <FlatList
          data={messages}
          renderItem={({ item }) => {
            const isItMe = item.sender == me.email;
            const senderInfo = isItMe ? me : user;
            const date = toDateTime(item.timestamp.seconds);
            const mins =
              date.getMinutes().toString().length == 1
                ? "0" + date.getMinutes()
                : date.getMinutes();
            const hourMin = date.getHours() + 3 + ":" + mins;
            return (
              <View
                style={[
                  styles.text,
                  isItMe ? styles.myMessage : styles.userMessage,
                  { paddingTop: item.continous ? 4 : 12 },
                ]}
              >
                {item.continous ? (
                  <View style={{ width: 32, marginHorizontal: 4 }} />
                ) : (
                  <Image
                    source={{ uri: senderInfo.photo }}
                    style={{
                      resizeMode: "contain",
                      width: 32,
                      height: 32,
                      marginHorizontal: 4,
                      borderRadius: 80,
                      display: item.continous ? "none" : "flex",
                    }}
                  />
                )}
                <View style={{ maxWidth: "64%" }}>
                  <View
                    style={[
                      {
                        backgroundColor: isItMe ? colors.bg2 : colors.third,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        flexDirection: "row",
                        flexWrap: "wrap",
                      },
                    ]}
                  >
                    <Text style={[styles.text, { flexWrap: "wrap" }]}>
                      {item.text}
                    </Text>
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
                        },
                      ]}
                    >
                      {hourMin}
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
          backgroundColor: colors.bg3,
          alignItems: "center",
          borderRadius: 4,
          paddingHorizontal: 8,
        }}
      >
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Write a Message..."
          placeholderTextColor={colors.bg}
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
    paddingBottom: 8,
    justifyContent: "center",
  },
  main: { flex: 1, paddingBottom: 4 },
  textInput: { padding: 8, flex: 1, fontSize: 16 },
  messageBox: {},
  myMessage: { flexDirection: "row-reverse" },
  userMessage: { flexDirection: "row" },
});