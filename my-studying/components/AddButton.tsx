import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type Props = {
  onPress?: () => void;
};

function AddButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
}

export default AddButton;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",

    width: 40,
    height: 40,
    borderRadius: 10,

    // 影（iOS）
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // 影（Android）
    elevation: 6,
  },
  plus: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.7,
    elevation: 0, // Androidの影消す
    shadowOpacity: 0, // iOSの影も消す

    transform: [
      { translateX: 2 },
      { translateY: 2 },
    ],
  } as ViewStyle,
});
