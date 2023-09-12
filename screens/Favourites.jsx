import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import HomeBook from "../components/HomeBook";
import { FontAwesome } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import "react-native-gesture-handler";
import useThemeColors from "../data/colors";
import { ScrollView } from "react-native";
import Splash from "../components/Splash";
import splitTen from "../hooks/splitTen";

const Favourites = ({ navigation }) => {
  const colors = useThemeColors();
  const [favBooks, setfavBooks] = useState([]);
  const [loading, setloading] = useState(false);
  const userStore = useSelector((state) => state.user);
  const user = userStore.user;

  const getBooks1 = async () => {
    setloading(true);
    setfavBooks([]);
    const userData = await firestore().collection("Users").doc(user.id).get();
    const fsArray =
      "bookmarks" in userData.data() ? userData.data().bookmarks : [];

    const splittedBookmarkArray = splitTen(fsArray);
    const booksCollection = firestore().collection("Books");

    let waitUntilFetch = new Promise((resolve, reject) => {
      if (splittedBookmarkArray.length == 0) resolve();
      splittedBookmarkArray.forEach(async (bookmarks, index, array) => {
        const books = (await booksCollection.where("id", "in", bookmarks).get())
          .docs;
        setfavBooks((prev) => prev.concat(books));
        if (index == array.length - 1) resolve();
      });
    });
    waitUntilFetch.then(() => setloading(false));
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await getBooks1();
    });

    return unsubscribe;
  }, [navigation]);

  const styles = {
    cont: [styleSheet.cont, { backgroundColor: colors.bg }],
    text: [styleSheet.text, { color: colors.text }],
    topnav: [styleSheet.topnav, { backgroundColor: colors.bg }],
    icon: [styleSheet.icon, { color: colors.first }],
    listCont: styleSheet.listCont,
    list: styleSheet.list,
    hasNoFavCont: [styleSheet.hasNoFavCont, { backgroundColor: colors.third }],
    heart: [styleSheet.heart, { color: colors.bg }],
  };

  return (
    <SafeAreaView style={styles.cont}>
      {loading ? (
        <Splash />
      ) : (
        <ScrollView
          showsHorizontalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          stickyHeaderHiddenOnScroll={true}
        >
          <View key={0}>
            <View style={styles.topnav}>
              <TouchableOpacity activeOpacity={0.7}>
                <FontAwesome name="bars" style={styles.icon} />
              </TouchableOpacity>
              <Text style={[styles.text, { color: colors.first }]}>
                Bookmarks
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <FontAwesome name="search" style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.listCont}>
            <MasonryList
              data={favBooks}
              renderItem={({ item }) => <HomeBook book={item} />}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.hasNoFavCont}>
                  <AntDesign name="heart" style={styles.heart} />
                  <Text style={[styles.text, { color: colors.bg }]}>
                    Try to add some bookmarks.
                  </Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Favourites;

const styleSheet = StyleSheet.create({
  cont: {
    flex: 1,
  },
  text: {
    fontFamily: "Raleway_400Regular",
    fontSize: 24,
  },
  topnav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  hasNoFavCont: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderRadius: 20,
    paddingVertical: 40,
    marginBottom: 16,
    width: "100%",
  },
  heart: {
    fontSize: 64,
  },
});
