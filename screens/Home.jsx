import {
  ActivityIndicator,
  BackHandler,
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

const Home = ({ route, navigation }) => {
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
        setBooks((prev) => [...prev, ...books.docs]);
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
    topnav: styleSheet.topnav,
    icon: [styleSheet.icon, { color: colors.text }],
    listCont: [styleSheet.listCont, { backgroundColor: colors.thirdBg }],
    list: styleSheet.list,
    hasNoFavCont: [styleSheet.hasNoFavCont, { backgroundColor: colors.bg }],
    heart: [styleSheet.heart, { color: colors.first }],
    image: styleSheet.image,
    loading: [styleSheet.loading, { backgroundColor: colors.bg }],
  };

  return (
    <SafeAreaView style={styles.cont}>
      <View style={styles.topnav}>
        <TouchableOpacity>
          <FontAwesome name="bars" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.text}>All Books</Text>
        <TouchableOpacity>
          <FontAwesome name="search" style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.listCont}>
        <MasonryList
          data={books}
          renderItem={({ item }) => <HomeBook book={item.data()} />}
          keyExtractor={(item) => item.data().id}
          numColumns={2}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.first} />
              <Text
                style={[styles.text, { color: colors.first, marginLeft: 12 }]}
              >
                Loading...
              </Text>
            </View>
          }
          onEndReachedThreshold={0.1}
          onEndReached={() => {
            setLastBook(books[books.length - 1].data().id);
            if (didMount) setisLoadNext(true);
          }}
        />
        {isLoadNext ? (
          <ActivityIndicator size="large" color={colors.first} />
        ) : (
          ""
        )}
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
    paddingHorizontal: 12,
  },
  text: {
    fontFamily: "Raleway_300Light",
    fontSize: 24,
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  topnav: {
    flexDirection: "row",
    height: 48,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  icon: {
    fontSize: 28,
  },
  listCont: {
    flex: 1,
    borderRadius: 32,
    marginTop: 24,
  },
  list: {
    paddingTop: 16,
    paddingLeft: 16,
  },
  loading: {
    marginRight: 16,
    alignSelf: "stretch",
    height: "100%",
    justifyContent: "center",
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    padding: 20,
  },
});
