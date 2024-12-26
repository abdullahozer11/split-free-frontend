import React from "react";
import { Stack } from "expo-router";

export default function GroupStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Group" }}
      />
      <Stack.Screen
        name="[group_id]"
        options={{ headerShown: false, title: "Group Details" }}
      />
    </Stack>
  );
}
