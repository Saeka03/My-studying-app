import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

function Empty() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collection is empty</Text>
      <Text style={styles.subtitle}>
        Start adding questions using the + icon
      </Text>
      <Image
        source={require("@/assets/images/img_empty_box.png")}
        style={styles.image}
      />
    </View>
  );
}

export default Empty;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
});
