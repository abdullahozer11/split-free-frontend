import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/Translated";
import { ActivityIndicator } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useAuth } from "@/src/providers/AuthProvider";
import { useProfile, useUpdateProfileSingleField } from "@/src/api/profiles";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/src/providers/SettingsProvider.js";

const Languages = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const { settings, updateSettings } = useSettings();

  const data = [
    { label: "English", value: "en" },
    { label: "Ελληνικά", value: "gr" },
    { label: "Français", value: "fr" },
    { label: "Türkçe", value: "tr" },
    { label: "Español", value: "es" },
    { label: "Deutsch", value: "de" },
    { label: "Italiano", value: "it" },
    { label: "Русский", value: "ru" },
  ];

  const { setSession, session } = useAuth();
  const { data: profile, isLoading, isError } = useProfile(session?.user.id);

  const { mutate: updateProfileSF } = useUpdateProfileSingleField();

  useEffect(() => {
    // Initialize language from profile data
    if (profile?.language) {
      setLanguage(profile.language);
      // Update settings context if profile language is different
      if (settings.language !== profile.language) {
        updateSettings({
          ...settings,
          language: profile.language,
        });
      }
    } else {
      // If no profile language, use settings language
      setLanguage(settings.language);
    }
  }, [profile?.language, settings.language]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    setSession(null);
    return <Text>Failed to fetch data</Text>;
  }

  const handleValueChange = (newValue) => {
    const lanTemp = language;
    setIsFocus(false);
    setLanguage(newValue);

    // Update settings context immediately
    updateSettings({
      ...settings,
      language: newValue,
    });

    // Update profile in database
    updateProfileSF(
      {
        id: profile?.id,
        field: "language",
        value: newValue,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(["profile"]);
        },
        onError: (error) => {
          // Revert both local state and settings on error
          setLanguage(lanTemp);
          updateSettings({
            ...settings,
            language: lanTemp,
          });
          setIsFocus(true);
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-16 justify-center px-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={36} />
        </TouchableOpacity>
      </View>
      <View className="flex-1 justify-center items-center px-6 gap-6">
        <Text className="text-3xl font-semibold">Select Language</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? "Select a language" : "..."}
          searchPlaceholder="Search..."
          value={language}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            handleValueChange(item.value);
          }}
          renderLeftIcon={() => (
            <Feather name="globe" size={20} color="black" />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Languages;

const styles = StyleSheet.create({
  dropdown: {
    width: "100%",
    height: 80,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 16,
  },
  placeholderStyle: {
    color: "#6b7280",
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
