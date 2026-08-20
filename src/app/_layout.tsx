import "../../global.css";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SettingsProvider } from "@/src/providers/SettingsProvider.js";
import { Stack } from "expo-router";

import AuthProvider from "@/src/providers/AuthProvider";
import QueryProvider from "@/src/providers/QueryProvider";
import { PaperProvider, useTheme } from "react-native-paper";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const theme = useTheme();

  const customTheme = {
    ...theme,
    dark: false,
  };

  return (
    <SettingsProvider>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <QueryProvider>
            <PaperProvider theme={customTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(global)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="join" options={{ headerShown: false }} />
              </Stack>
            </PaperProvider>
          </QueryProvider>
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
