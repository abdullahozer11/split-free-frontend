import React from "react";
import { Stack } from "expo-router";
import { StackScreen } from "@/src/components/Translated";

export default function SettingsStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StackScreen name="index" options={{ title: "Settings" }} />
      <StackScreen name="notifications" options={{ title: "Notifications" }} />
      <StackScreen name="language" options={{ title: "Language" }} />
      <StackScreen name="terms" options={{ title: "Terms and conditions" }} />
      <StackScreen name="faq" options={{ title: "FAQ" }} />
      <StackScreen name="password" options={{ title: "Password" }} />
    </Stack>
  );
}
