import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import HomeBook from "../components/HomeBook";
import { FontAwesome } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import "react-native-gesture-handler";
import "react-native-safe-area-context";
import useThemeColors from "../data/colors";
import Splash from "../components/Splash";

const Home = () => {
  const colors = useThemeColors();
  const [books, setBooks] = useState([]);
  const [lastBook, setLastBook] = useState({});
  const [didMount, setdidMount] = useState(false);
  const [isLoadNext, setisLoadNext] = useState(false);
  const firstFetch = async () => {
    firestore()
      .collection("Books")
      .orderBy("id")
      .limit(30)
      .get()
      .then((books) => {
        setBooks(books.docs);
      });
  };

  const get30Books = async () => {
    await firestore()
      .collection("Books")
      .orderBy("id")
      .startAfter(lastBook)
      .limit(30)
      .get()
      .then((books) => {
        if (books.empty) {
          setdidMount(false);
          return;
        }
        setBooks((prev) => prev.concat(books.docs));
      })
      .catch((error) => console.log(error));
    setisLoadNext(false);
  };

  useEffect(() => {
    if (didMount && isLoadNext) get30Books();
  }, [lastBook]);

  useEffect(() => {
    firstFetch();
    setdidMount(true);
  }, []);

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

  return (
    <SafeAreaView style={styles.cont}>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
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
            <TouchableOpacity>
              <FontAwesome name="bars" style={styles.icon} />
            </TouchableOpacity>
            <Text style={[styles.text, { color: colors.first }]}>
              All Books
            </Text>
            <TouchableOpacity>
              <FontAwesome name="search" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listCont}>
          <MasonryList
            data={books}
            renderItem={({ item }) => <HomeBook book={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Splash />}
          />
          {isLoadNext ? (
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
    height: 56,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 28,
  },
  listCont: {
    flex: 1,
  },
  list: {
    paddingTop: 16,
    paddingLeft: 16,
  },
  loading: {
    height: 700,
    justifyContent: "center",
    alignSelf: "center",
  },
});
