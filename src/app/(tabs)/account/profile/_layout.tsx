import React from "react";
import { Stack } from "expo-router";
import { StackScreen } from "@/src/components/Translated";

export default function ProfileStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StackScreen name="index" options={{ title: "Profile details" }} />
      <StackScreen name="update" options={{ title: "Update profile" }} />
    </Stack>
  );
}
