import { Stack } from "expo-router";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider";

export default function AuthLayout() {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;
  return (
    <Stack>
      <Stack.Screen
        name={int["terms"] || "terms"}
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
