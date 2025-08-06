import FontAwesome from "@expo/vector-icons/FontAwesome";
import {DefaultTheme, ThemeProvider} from "@react-navigation/native";
import { SettingsProvider } from "@/src/providers/SettingsProvider.js";
import {useFonts} from "expo-font";
import {Stack} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect} from "react";

import AuthProvider from "@/src/providers/AuthProvider";
import QueryProvider from "@/src/providers/QueryProvider";
import {PaperProvider, useTheme} from "react-native-paper";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav/>;
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
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                <Stack.Screen name="(global)" options={{headerShown: false}}/>
                <Stack.Screen name="join" options={{headerShown: false}}/>
              </Stack>
            </PaperProvider>
          </QueryProvider>
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
