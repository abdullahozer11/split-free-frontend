import React from "react";
import { Stack } from "expo-router";
import { useTranslations } from "@/src/components/Translated";

export default function SettingsStack() {
  const { t } = useTranslations();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: t("Settings") }} />
      <Stack.Screen
        name="notifications"
        options={{ title: t("Notifications") }}
      />
      <Stack.Screen name="language" options={{ title: t("Language") }} />
      <Stack.Screen
        name="terms"
        options={{ title: t("Terms and conditions") }}
      />
      <Stack.Screen name="faq" options={{ title: t("FAQ") }} />
      <Stack.Screen name="password" options={{ title: t("Password") }} />
    </Stack>
  );
}
