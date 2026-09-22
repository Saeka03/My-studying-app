import AddButton from "@/components/AddButton";
import Empty from "@/components/Empty";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Empty />
      <View style={styles.buttonWrapper}>
        <AddButton onPress={() => router.push("/add-question")} />
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
