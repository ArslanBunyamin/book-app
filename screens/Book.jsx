import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Ionicons,
  Entypo,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { useState, useEffect, useRef } from "react";
import useThemeColors from "../data/colors";
import Splash from "../components/Splash";
import MasonryList from "@react-native-seoul/masonry-list";
import Comment from "../components/Comment";
import ScaledImg from "../components/ScaledImg";
import Modal from "react-native-modal";

export default Book = ({ route, navigation }) => {
  const windowWidth = Dimensions.get("window").width;
  const colors = useThemeColors();
  const book = route.params?.book;
  const bookId = route.params?.bookId;
  const bookObject = firestore().collection("Books").doc(bookId);

  const [descOpened, setdescOpened] = useState(false);
  const [loading, setloading] = useState(true);
  const [comments, setcomments] = useState([]);
  const [isCommenting, setisCommenting] = useState(false);
  const textInputRef = useRef(null);
  const [inputValue, setinputValue] = useState("");
  const [isReplying, setisReplying] = useState(false);
  const [bookmarked, setbookmarked] = useState(false);
  const [replyId, setreplyId] = useState(null);
  const [tagName, settagName] = useState("");
  const [modalVisible, setmodalVisible] = useState(false);

  const user = useSelector((state) => state.user).user; //redux
  const userDoc = firestore().collection("Users").doc(user.id); //firestore

  const fetchBookmarks = async () => {
    const userData = await userDoc.get();
    let bookmarks = userData.data().bookmarks;
    if (bookmarks == undefined) bookmarks = [];
    setbookmarked(bookmarks.includes(book.id));
    setloading(false);
  };
  const fetchComments = async () => {
    const comments = await (await bookObject.get()).data().comments;
    if (comments != undefined) setcomments(comments);
  };

  const bookmarkButtonPressed = async () => {
    if (bookmarked) {
      await userDoc.update({
        bookmarks: firestore.FieldValue.arrayRemove(book.id),
      });
      setbookmarked(false);
    } else {
      await userDoc.update({
        bookmarks: firestore.FieldValue.arrayUnion(book.id),
      });
      setbookmarked(true);
    }
  };

  const commentButtonPressed = ({ username, id }) => {
    setisCommenting(true);
    if (username != undefined) {
      setisReplying(true);
      settagName("@" + username + " ");
      setreplyId(id);
    } else {
      setinputValue("");
    }
  };

  const sendComment = async () => {
    if (inputValue != "") {
      const randomId = firestore().collection("Books").doc().id;
      if (isReplying) {
        let tempComments = comments;
        const theIndex = tempComments.findIndex(
          (comment) => comment.id == replyId
        );
        tempComments[theIndex].subComments.push({
          tagName: tagName,
          text: inputValue.trim(),
          timestamp: new Date(),
          user: user,
          id: randomId,
          isReply: true,
          parentId: replyId,
        });
        await bookObject.update({
          comments: tempComments,
        });
      } else {
        await bookObject.update({
          comments: firestore.FieldValue.arrayUnion({
            text: inputValue,
            timestamp: new Date(),
            user: user,
            id: randomId,
            isReply: false,
            subComments: [],
          }),
        });
      }
    }
    fetchComments();
    setinputValue("");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBookmarks();
      fetchComments();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isCommenting) {
      textInputRef.current.focus();
    }
  }, [isCommenting]);

  useEffect(() => {
    if (book.description.split(" ").length <= 40) setdescOpened(true);
  }, []);

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
    icon: [styleSheet.icon, { color: colors.text }],
    topnav: [
      styleSheet.topnav,
      { backgroundColor: colors.bg, borderBottomColor: colors.placeholder },
    ],
    genre: [styleSheet.genre, { color: colors.first }],
    bookName: styleSheet.bookName,
    author: styleSheet.author,
    date: styleSheet.date,
    main: styleSheet.main,
    image: styleSheet.image,
    pageCount: [styleSheet.pageCount, { color: colors.second }],
    desc: styleSheet.desc,
    commentCont: [styleSheet.commentCont, { borderTopColor: colors.bg3 }],
    noComments: [styleSheet.noComments, { color: colors.third }],
    textInput: [styleSheet.textInput, { color: colors.bg }],
    commentList: styleSheet.commentList,
    comment: styleSheet.comment,
    modalCont: [
      styleSheet.modalCont,
      {
        maxWidth: windowWidth - 40,
        borderColor: colors.fifth,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.cont}>
      {loading ? (
        <Splash />
      ) : (
        <View style={{ flex: 1 }}>
          <Modal
            animationIn={"pulse"}
            animationOut={"zoomOut"}
            isVisible={modalVisible}
            backdropColor={colors.bg}
            onBackButtonPress={() => {
              setmodalVisible(false);
            }}
            onBackdropPress={() => {
              setmodalVisible(false);
            }}
          >
            <View style={styles.modalCont}>
              <ScaledImg
                style={{ resizeMode: "contain", aspectRatio: 1 }}
                uri={book.coverUrl}
                desiredWidth={windowWidth - 40}
              />
            </View>
          </Modal>
          <View style={styles.topnav}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Entypo name="chevron-left" style={styles.icon} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.text, styles.date]}>{book.date}</Text>
            </View>
          </View>
          <View style={styles.main}>
            <ScrollView
              contentContainerStyle={styleSheet.bookScroller}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  paddingBottom: 16,
                }}
              >
                <FlatList
                  horizontal={true}
                  data={book.categories}
                  renderItem={({ item }) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate("library", {
                            genre: item.trim(),
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.text, styles.genre]}>
                          {item.trim()}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item) => book.categories.indexOf(item)}
                />

                <View style={{ paddingVertical: 4 }}>
                  <Text style={[styles.text, styles.bookName]}>
                    {book.title}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.text}>From </Text>
                    <Text style={[styles.text, styles.author]}>
                      {book.author}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setmodalVisible(true)}
                activeOpacity={0.9}
              >
                <Image style={styles.image} source={{ uri: book.coverUrl }} />
              </TouchableOpacity>
              <View
                style={{
                  paddingTop: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[styles.text, styles.pageCount]}>
                  {book.pageCount} pages
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={commentButtonPressed}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="comment-text-multiple-outline"
                      style={{
                        fontSize: 28,
                        color: colors.third,
                        paddingRight: 8,
                        flex: 1,
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={bookmarkButtonPressed}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={bookmarked ? "bookmark" : "bookmark-outline"}
                      style={[
                        styles.icon,
                        { fontSize: 32, color: colors.third },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!descOpened) setdescOpened(true);
                }}
                activeOpacity={descOpened ? 1 : 0.8}
              >
                <Text style={[styles.text, styles.desc]}>
                  {descOpened
                    ? book.description
                    : book.description.split(" ").slice(0, 40).join(" ")}
                  <Text
                    style={[
                      styles.text,
                      { color: colors.first, fontFamily: "Raleway_900Black" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.text,
                        {
                          color: colors.first,
                        },
                      ]}
                    >
                      {descOpened ? "" : " . . . read more"}
                    </Text>
                  </Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.commentCont}>
                <MasonryList
                  contentContainerStyle={styles.commentList}
                  data={comments}
                  renderItem={({ item }) => (
                    <Comment replyHandler={commentButtonPressed} item={item} />
                  )}
                  keyExtractor={(item) => item.id}
                  numColumns={1}
                  ListEmptyComponent={
                    <Text style={styles.noComments}>
                      There is no comment yet.
                    </Text>
                  }
                />

                {isCommenting ? (
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: isCommenting ? colors.third : colors.bg,
                      alignItems: "center",
                      borderRadius: 50,
                      paddingHorizontal: 8,
                    }}
                  >
                    <TextInput
                      ref={textInputRef}
                      style={styles.textInput}
                      placeholder="Write a Comment..."
                      placeholderTextColor={colors.placeholder}
                      cursorColor={colors.bg}
                      multiline={true}
                      selectionColor={colors.first}
                      onEndEditing={() => {
                        setisCommenting(false);
                        setisReplying(false);
                        settagName("");
                      }}
                      onChangeText={(e) => setinputValue(e)}
                      value={inputValue}
                    />
                    <TouchableOpacity onPress={sendComment} activeOpacity={0.7}>
                      <FontAwesome
                        name="send"
                        style={[
                          styles.icon,
                          {
                            fontSize: 24,
                            padding: 8,
                            color: colors.bg,
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  ""
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
  },
  text: {
    fontFamily: "Raleway_500Medium",
    fontSize: 16,
  },
  icon: {
    fontSize: 28,
  },
  topnav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  genre: {
    fontSize: 16,
    marginRight: 8,
  },
  bookName: {
    fontFamily: "Raleway_700Bold",
    fontSize: 36,
  },
  author: {
    fontSize: 16,
    fontFamily: "Raleway_700Bold",
  },
  date: {
    fontFamily: "Raleway_400Regular",
  },
  main: {
    flex: 1,
    overflow: "hidden",
  },
  bookScroller: { paddingHorizontal: 12 },
  image: {
    aspectRatio: 0.9,
    resizeMode: "cover",
    borderRadius: 48,
  },
  pageCount: {
    fontFamily: "Raleway_300Light",
    paddingHorizontal: 12,
    fontSize: 20,
    alignSelf: "center",
  },
  desc: {
    fontFamily: "Raleway_700Bold",
    lineHeight: 24,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  commentCont: {
    borderTopWidth: 1,
    flex: 1,
  },
  noComments: {
    fontSize: 20,
    fontFamily: "Raleway_300Light",
    textAlign: "center",
    paddingVertical: 12,
  },
  textInput: { padding: 8, flex: 1, fontSize: 16, maxHeight: 40 },
  commentList: {},
  comment: { padding: 8, flexDirection: "row", alignItems: "center" },
  pp: {
    resizeMode: "contain",
  },
  modalCont: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
});
