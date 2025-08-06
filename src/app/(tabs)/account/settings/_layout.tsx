import React from "react";
import { Stack } from "expo-router";

export default function SettingsStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="language" options={{ title: "Language" }} />
      <Stack.Screen name="terms" options={{ title: "Terms and conditions" }} />
      <Stack.Screen name="faq" options={{ title: "FAQ" }} />
      <Stack.Screen name="password" options={{ title: "Password" }} />
    </Stack>
  );
}
