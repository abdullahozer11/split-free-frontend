import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useAuth } from "@/src/providers/AuthProvider";
import { useProfile, useUpdateProfileSingleField } from "@/src/api/profiles";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/src/providers/SettingsProvider.js";
import { useTranslatedAlert, Text } from "@/src/components/Translated";
import { ActivityIndicator } from "react-native-paper";
import CustomDropdown from "@/src/components/CustomDropdown";

const Languages = () => {
  const { alert } = useTranslatedAlert();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { settings, updateSettings } = useSettings();
  const { setSession, session } = useAuth();
  const { data: profile, isLoading, isError } = useProfile(session?.user.id);
  const { mutate: updateProfileSF } = useUpdateProfileSingleField();
  const [language, setLanguage] = useState(null);

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

  useEffect(() => {
    if (profile?.language) {
      setLanguage(profile.language);
      if (settings.language !== profile.language) {
        updateSettings({ ...settings, language: profile.language });
      }
    } else {
      setLanguage(settings.language);
    }
  }, [profile?.language, settings.language]);

  if (isLoading) return <ActivityIndicator />;
  if (isError) {
    setSession(null);
    return <Text>Failed to fetch data</Text>;
  }

  const handleValueChange = (newValue) => {
    const lanTemp = language;
    setLanguage(newValue);
    updateSettings({ ...settings, language: newValue });

    updateProfileSF(
      { id: profile?.id, field: "language", value: newValue },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(["profile", profile?.id]);
        },
        onError: (error) => {
          setLanguage(lanTemp);
          updateSettings({ ...settings, language: lanTemp });
          console.error("Server error:", error);
          alert("Error", "Server error.");
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-16 justify-center mt-[50px] px-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={36} color="black" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 justify-center items-center px-6 gap-6">
        <Text className="text-3xl font-semibold">Select Language</Text>
        <CustomDropdown
          data={data}
          containerClassName={"w-full pl-5 mt-5"}
          value={language}
          onChange={handleValueChange}
          placeholder="Select Language"
          iconName="globe"
        />
      </View>
    </SafeAreaView>
  );
};

export default Languages;
