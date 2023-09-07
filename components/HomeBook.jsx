import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import ScaledImg from "./ScaledImg";

const HomeBook = ({ book }) => {
  const windowWidth = Dimensions.get("window").width;
  const navigation = useNavigation();
  return (
    <View style={styles.cont}>
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
            desiredWidth={windowWidth / 2 - 30}
            uri={book.data().coverUrl}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeBook;

const styles = StyleSheet.create({
  imgCont: {
    marginBottom: 16,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  img: {
    resizeMode: "contain",
  },
});
