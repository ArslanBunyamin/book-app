import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import HomeBook from "../components/HomeBook";
import {
  FontAwesome,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import "react-native-gesture-handler";
import "react-native-safe-area-context";
import useThemeColors from "../data/colors";
import Splash from "../components/Splash";
import splitTen from "../hooks/splitTen";
import Modal from "react-native-modal";

const Home = ({ route, navigation }) => {
  const windowWidth = Dimensions.get("window").width;
  const colors = useThemeColors();
  const [books, setBooks] = useState([]);
  const [lastBook, setLastBook] = useState({});
  const [didMount, setdidMount] = useState(false);
  const [isLoadNext, setisLoadNext] = useState(false);
  const [mappedBooks, setmappedBooks] = useState([]);
  const [searchResult, setsearchResult] = useState([]);
  const [inputValue, setinputValue] = useState("");
  const textInputRef = useRef(null);
  const [showSearchInput, setshowSearchInput] = useState(false);
  const [modalVisible, setmodalVisible] = useState(false);
  const [genres, setgenres] = useState([]);
  const [title, settitle] = useState("All Books");

  const booksCollection = firestore().collection("Books");

  const firstFetch = async () => {
    await booksCollection
      .orderBy("id")
      .limit(10)
      .get()
      .then((books) => {
        setBooks(books.docs);
        setdidMount(true);
      });
  };

  const get10Books = async () => {
    await booksCollection
      .orderBy("id")
      .startAfter(lastBook)
      .limit(10)
      .get()
      .then((books) => {
        if (books.empty) {
          setdidMount(false);
          setisLoadNext(false);
          return;
        }
        setBooks((prev) => prev.concat(books.docs));
      });
    setisLoadNext(false);
  };

  const getMappedBooks = async () => {
    booksCollection.get().then((e) => {
      const mappedBooks = e.docs.map((book) => {
        return {
          title: book.data().title.toLowerCase().split(" "),
          author: book.data().author.toLowerCase().split(" "),
          id: book.data().id,
        };
      });
      setmappedBooks(mappedBooks);
    });
  };

  const searchBook = async (text = "") => {
    if (text.length < 3) {
      setsearchResult([]);
      return;
    }
    const splittedText = text.toLowerCase().split(" ", 12);
    const theText = splittedText.filter(
      (word) =>
        !(
          word.length < 3 ||
          word == "of" ||
          word == "the" ||
          word == "an" ||
          word == "at" ||
          word == "is" ||
          word == "and" ||
          word == "in"
        )
    );
    if (theText.length == 0) {
      setsearchResult([]);
      return;
    }
    const result = mappedBooks.filter((book) => {
      for (let i = 0; i < theText.length; i++) {
        if (book.author.includes(theText[i]) || book.title.includes(theText[i]))
          return true;
      }
    });
    if (result.length == 0) {
      setsearchResult([]);
    }
    const theIds = splitTen(result.map((book) => book.id));
    let theFirestoreResult = [];

    const waitForFetch = new Promise((resolve, reject) => {
      theIds.forEach(async (ids, index, array) => {
        const theBooks = (await booksCollection.where("id", "in", ids).get())
          .docs;
        theFirestoreResult.push(...theBooks);
        if (index == array.length - 1) resolve();
      });
    });
    waitForFetch.then(() => {
      setsearchResult(theFirestoreResult);
    });
  };

  const getGenres = async () => {
    const genres = await firestore().collection("Genres").get();
    setgenres(genres.docs);
  };

  const checkForParamGenre = async () => {
    const paramGenre = route.params?.genre;
    if (paramGenre != undefined) {
      const idList = (
        await firestore().collection("Genres").doc(paramGenre).get()
      ).data().bookIds;

      getGenreBooks(idList);
      settitle(paramGenre);
    }
  };

  useEffect(() => {
    checkForParamGenre();
  }, [route.params]);

  useEffect(() => {
    searchBook(inputValue.trim());
  }, [inputValue]);

  useEffect(() => {
    if (didMount) get10Books();
  }, [lastBook]);

  useEffect(() => {
    firstFetch();
    getMappedBooks();
    getGenres();
    checkForParamGenre();
  }, []);

  useEffect(() => {
    if (showSearchInput) textInputRef.current.focus();
  }, [showSearchInput]);

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
    topnav: [styleSheet.topnav, { backgroundColor: colors.bg }],
    icon: [styleSheet.icon, { color: colors.first }],
    listCont: styleSheet.listCont,
    list: styleSheet.list,
    hasNoFavCont: [styleSheet.hasNoFavCont, { backgroundColor: colors.bg }],
    heart: [styleSheet.heart, { color: colors.first }],
    image: styleSheet.image,
    loading: [styleSheet.loading],
    textInput: [
      styleSheet.textInput,
      {
        color: colors.bg,
        backgroundColor: colors.second,
      },
    ],
    modalCont: [
      styleSheet.modalCont,
      {
        maxWidth: windowWidth - 40,
        borderColor: colors.fifth,
        backgroundColor: colors.bg2,
      },
    ],
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const getGenreBooks = async (givenList) => {
    const splitted = splitTen(givenList);
    let books = [];

    const waitUntilFetch = new Promise((resolve, reject) => {
      splitted.forEach(async (idList, index, array) => {
        const theBooks = (
          await firestore().collection("Books").where("id", "in", idList).get()
        ).docs;
        books.push(...theBooks);
        if (index == array.length - 1) resolve();
      });
    });

    waitUntilFetch.then(() => {
      setBooks(books);
    });
  };

  return (
    <SafeAreaView style={styles.cont}>
      <Modal
        animationIn={"slideInLeft"}
        animationOut={"slideOutLeft"}
        hideModalContentWhileAnimating={true}
        isVisible={modalVisible}
        backdropColor={colors.bg}
        onBackdropPress={() => {
          setmodalVisible(false);
        }}
      >
        <View style={styles.modalCont}>
          <FlatList
            data={genres}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setmodalVisible(false);
                    setBooks([]);
                    settitle(item.id);
                    getGenreBooks(item.data().bookIds);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    flexDirection: "row",
                    backgroundColor: colors.bg,
                    margin: 4,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <FontAwesome5
                    name="align-right"
                    style={[
                      styles.text,
                      { color: colors.third, marginRight: 4 },
                    ]}
                  />
                  <Text style={[styles.text, { fontSize: 20 }]}>{item.id}</Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ width: "100%" }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
          />
        </View>
      </Modal>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            if (route.params?.genre != undefined) return;
            if (didMount) setisLoadNext(true);
            setLastBook(books[books.length - 1].data().id);
          }
        }}
        scrollEventThrottle={400}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
      >
        <View key={0}>
          <View style={styles.topnav}>
            <TouchableOpacity
              onPress={() => {
                setmodalVisible(true);
              }}
              activeOpacity={0.7}
              style={{ paddingVertical: 16, flexGrow: 1 }}
            >
              <FontAwesome name="bars" style={styles.icon} />
            </TouchableOpacity>
            {!showSearchInput ? (
              <TouchableOpacity
                onPress={async () => {
                  setBooks([]);
                  await firstFetch();
                  settitle("All Books");
                  navigation.setParams({ genre: undefined });
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor:
                    title != "All Books" ? colors.bg2 : "transparent",
                  padding: 8,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={[
                    styles.text,
                    {
                      color: colors.first,
                    },
                  ]}
                >
                  {title}
                </Text>
                {title != "All Books" ? (
                  <FontAwesome
                    name="close"
                    style={[
                      styles.text,
                      { color: colors.first, marginLeft: 8 },
                    ]}
                  />
                ) : (
                  ""
                )}
              </TouchableOpacity>
            ) : (
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="...Search a Book or Author"
                placeholderTextColor={colors.placeholder}
                cursorColor={colors.bg}
                multiline={true}
                selectionColor={colors.text}
                onChangeText={(e) => setinputValue(e)}
                value={inputValue}
                clearTextOnFocus={false}
                onEndEditing={() => {
                  setinputValue("");
                  setshowSearchInput(false);
                }}
              />
            )}
            <TouchableOpacity
              onPress={() => {
                setshowSearchInput(true);
              }}
              activeOpacity={0.7}
              style={{
                paddingVertical: 16,
                flexGrow: 1,
                display: showSearchInput ? "none" : "flex",
                alignItems: "flex-end",
              }}
            >
              <FontAwesome name="search" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listCont}>
          <MasonryList
            data={inputValue.length != 0 ? searchResult : books}
            renderItem={({ item }) => <HomeBook book={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              inputValue.length != 0 ? (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                    borderRadius: 20,
                    paddingVertical: 40,
                    marginBottom: 16,
                    width: "100%",
                  }}
                >
                  <MaterialCommunityIcons
                    name="book-search"
                    style={{ fontSize: 100, color: colors.third }}
                  />
                  <Text style={[styles.text, { color: colors.third }]}>
                    Book not Found.
                  </Text>
                </View>
              ) : (
                <Splash />
              )
            }
          />
          {isLoadNext && searchResult.length == 0 ? (
            <ActivityIndicator size="large" color={colors.first} />
          ) : (
            ""
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
  },
  text: {
    fontFamily: "Raleway_500Medium",
    fontSize: 24,
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  topnav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    elevation: 100,
  },
  icon: {
    fontSize: 28,
  },
  listCont: {
    flex: 1,
  },
  list: {
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  loading: {
    height: 700,
    justifyContent: "center",
    alignSelf: "center",
  },
  textInput: {
    flexGrow: 10,
    marginHorizontal: 20,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 64,
    maxHeight: 40,
  },
  modalCont: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    maxHeight: "75%",
  },
});
