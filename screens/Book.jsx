import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native-gesture-handler";
import { useState, useEffect } from "react";
import useThemeColors from "../data/colors";
import Splash from "../components/Splash";
import { Button } from "react-native";

export default Book = ({ route, navigation }) => {
  const colors = useThemeColors();
  const book = route.params?.book;
  const bookId = route.params?.bookId;
  const bookObject = firestore().collection("Books").doc(bookId);

  let date = new Date(book.date);
  const [descOpened, setdescOpened] = useState(false);
  const [loading, setloading] = useState(true);
  const [comments, setcomments] = useState([]);
  const [commentsEmpty, setcommentsEmpty] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  date =
    date.getFullYear() + " " + months[date.getMonth()] + " " + date.getDate();

  const [bookmarked, setbookmarked] = useState(false);
  const user = useSelector((state) => state.user).user; //redux
  const userDoc = firestore().collection("Users").doc(user.id); //firestore

  const fetchBookmarks = async () => {
    const userData = await userDoc.get();
    const bookmarks = userData.data().bookmarks;
    setbookmarked(bookmarks.includes(book.id));
    setloading(false);
  };

  const buttonHandler = async () => {
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
  const checkIfCommentsExists = async () => {
    if (book.comments == undefined) {
      await bookObject.update({
        comments: [],
      });
      setcommentsEmpty(true);
    }
    if (book.comments == []) setcommentsEmpty(true);
  };
  const commentHandler = async () => {
    await bookObject.update({
      comments: ["apsdıfhğasoıdf"],
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      checkIfCommentsExists();
      fetchBookmarks();
    });
    return unsubscribe;
  }, [navigation]);

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
    icon: [styleSheet.icon, { color: colors.text }],
    topnav: styleSheet.topnav,
    genre: [styleSheet.genre, { color: colors.fourth }],
    bookName: styleSheet.bookName,
    author: styleSheet.author,
    date: styleSheet.date,
    main: styleSheet.main,
    image: styleSheet.image,
    pageCount: [styleSheet.pageCount, { color: colors.second }],
    desc: styleSheet.desc,
  };

  return (
    <SafeAreaView style={styles.cont}>
      {loading ? (
        <Splash />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.topnav}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Entypo name="chevron-left" style={styles.icon} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.text, styles.date]}>{date}</Text>
            </View>
          </View>
          <View
            style={{
              padding: 16,
            }}
          >
            <FlatList
              data={book.categories}
              renderItem={({ item }) => (
                <Text style={[styles.text, styles.genre]}>{item}</Text>
              )}
              keyExtractor={(item) => book.categories.indexOf(item)}
              contentContainerStyle={{
                flexDirection: "row",
              }}
            />
            <View style={{ paddingVertical: 4 }}>
              <Text style={[styles.text, styles.bookName]}>{book.title}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.text}>From </Text>
                <Text style={[styles.text, styles.author]}>{book.author}</Text>
              </View>
            </View>
          </View>
          <View style={styles.main}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Image style={styles.image} source={{ uri: book.coverUrl }} />
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
                <TouchableOpacity onPress={buttonHandler}>
                  <Ionicons
                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                    style={[
                      styles.icon,
                      { paddingRight: 8, fontSize: 32, color: colors.third },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setdescOpened((prev) => !prev);
                }}
                style={{ paddingVertical: 16 }}
              >
                <Text style={[styles.text, styles.desc]}>
                  {descOpened
                    ? book.description
                    : book.description.split(" ").slice(0, 24).join(" ")}
                  <Text
                    style={[
                      styles.text,
                      { color: colors.first, fontFamily: "Raleway_900Black" },
                    ]}
                  >
                    {descOpened ? "" : " . . ."}
                  </Text>
                </Text>
              </TouchableOpacity>
              <View style={styles.commentCont}></View>
              <View style={{ height: 24 }} />
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
    height: 48,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 12,
  },
  genre: {
    fontSize: 16,
    marginRight: 16,
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
    marginTop: 8,
    borderRadius: 48,
    overflow: "hidden",
    paddingHorizontal: 12,
  },
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
  },
  commentCont: {},
});
