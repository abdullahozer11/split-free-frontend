import React from "react";
import { View, Text, Button } from "react-native";
import { useTheme } from "@/src/providers/ThemeProvider";

export default function ThemeScreen() {
  const { theme, themeName, switchTheme } = useTheme();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ color: theme.text, fontSize: 18 }}>Current Theme: {themeName}</Text>

      <View style={{ marginVertical: 10 }}>
        <Button title="Light Theme" onPress={() => switchTheme("light")} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <Button title="Dark Theme" onPress={() => switchTheme("dark")} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <Button title="Pastel Theme" onPress={() => switchTheme("pastel")} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <Button title="Retro Theme" onPress={() => switchTheme("retro")} />
      </View>

      <Text style={{ color: theme.primary, marginTop: 20, fontSize: 20 }}>
        Primary Color Example
      </Text>
      <Text style={{ color: theme.error, marginTop: 10, fontSize: 16 }}>Error Color Example</Text>
    </View>
  );
}
