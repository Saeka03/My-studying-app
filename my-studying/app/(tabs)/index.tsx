import AddButton from "@/components/AddButton";
import Empty from "@/components/Empty";
import { View, StyleSheet } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Empty />
      <View style={styles.buttonWrapper}>
        <AddButton onPress={() => console.log("押された")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 30,
  },
  buttonWrapper: {
    alignSelf: "flex-end",
  },
});
