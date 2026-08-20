import React from "react";
import { Stack } from "expo-router";
import { useTranslations } from "@/src/components/Translated";

export default function ProfileStack() {
  const { t } = useTranslations();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: t("Profile details") }} />
      <Stack.Screen name="update" options={{ title: t("Update profile") }} />
    </Stack>
  );
}
