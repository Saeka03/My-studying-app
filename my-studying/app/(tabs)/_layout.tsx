import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarButton: HapticTab,

        headerStyle: {
          backgroundColor: "#C2E1C2",
        },

        headerTintColor: "#778472",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",

          headerLeft: () => (
            <Pressable onPress={() => router.push("/")}>
              <Text style={styles.title}>MY ANKI</Text>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#778472",
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 16,
    letterSpacing: 0.5,
  },
});
