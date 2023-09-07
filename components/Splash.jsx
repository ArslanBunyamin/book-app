import { StyleSheet, View } from "react-native";
import React from "react";
import bookgif from "../assets/bookgif.gif";
import { Image } from "react-native";

const Splash = () => {
  return (
    <View style={styles.loading}>
      <Image source={bookgif} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  loading: {
    height: 700,
    justifyContent: "center",
    alignSelf: "center",
  },
});
