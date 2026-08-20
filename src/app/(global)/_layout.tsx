import { Stack } from "expo-router";

export default function GlobalLayout() {
  return (
    <Stack>
      <Stack.Screen name="terms" options={{ headerShown: false }} />
    </Stack>
  );
}
