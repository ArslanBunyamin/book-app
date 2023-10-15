import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScaledImg from "./ScaledImg";
// import { useEffect } from "react";
// import firestore from "@react-native-firebase/firestore";

const HomeBook = ({ book }) => {
  const windowWidth = Dimensions.get("window").width;
  const navigation = useNavigation();

  // useEffect(() => {
  //   const genres = book.data().categories;
  //   genres.forEach((genre) => {
  //     firestore()
  //       .collection("Genres")
  //       .doc(genre.trim())
  //       .set(
  //         {
  //           bookIds: firestore.FieldValue.arrayUnion(book.data().id),
  //         },
  //         { merge: true }
  //       );
  //   });
  // }, []);

  return (
    <View style={styles.cont}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("book", {
            book: book.data(),
            bookId: book.id,
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.imgCont}>
          <ScaledImg
            style={styles.img}
            desiredWidth={windowWidth / 2 - 26}
            uri={book.data().coverUrl}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeBook;

const styles = StyleSheet.create({
  cont: {},
  imgCont: {
    overflow: "hidden",
    margin: 8,
    borderRadius: 24,
  },
  img: {
    resizeMode: "contain",
  },
});
