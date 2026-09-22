import { Tabs, useRouter } from "expo-router";
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
          backgroundColor: "#426F45",
        },
        headerShadowVisible: false,
        headerTintColor: "#FFFFFF",
        headerTitleAlign: "center",
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Questions",
        }}
      />
      <Tabs.Screen
        name="add-question"
        options={{
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/")}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </Pressable>
          ),
          href: null,
          title: "Add Question",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  backButton: {
    marginLeft: 12,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  backButtonPressed: {
    opacity: 0.65,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
