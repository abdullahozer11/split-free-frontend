import React from "react";
import { Stack } from "expo-router";

export default function ProfileStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Profile details" }} />
      <Stack.Screen name="update" options={{ title: "Update profile" }} />
    </Stack>
  );
}
