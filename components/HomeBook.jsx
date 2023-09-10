import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScaledImg from "./ScaledImg";
import useThemeColors from "../data/colors";

const HomeBook = ({ book }) => {
  const windowWidth = Dimensions.get("window").width;
  const navigation = useNavigation();
  const colors = useThemeColors();
  return (
    <View style={[styles.cont]}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("book", {
            book: book.data(),
            bookId: book.id,
          });
        }}
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
