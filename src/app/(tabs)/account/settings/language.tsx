import { Alert, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useAuth } from "@/src/providers/AuthProvider";
import { useProfile, useUpdateProfileSingleField } from "@/src/api/profiles";
import { useQueryClient } from "@tanstack/react-query";

const Languages = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const data = [
    { label: "English", value: "en" },
    // { label: 'French', value: 'fr' },
  ];

  const { setSession, session } = useAuth();
  const { data: profile, isLoading, isError } = useProfile(session?.user.id);

  const { mutate: updateProfileSF } = useUpdateProfileSingleField();

  useEffect(() => {
    setLanguage(profile?.language);
  }, [profile?.language]);

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
    updateProfileSF(
      {
        id: profile?.id,
        field: "language",
        value: newValue,
      },
      {
        onSuccess: async () => {
          // console.log('handleValueChange success');
          await queryClient.invalidateQueries(["profile"]);
        },
        onError: (error) => {
          setLanguage(lanTemp);
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
          className="w-full border-gray-300 border rounded-md px-4 h-20"
          placeholderStyle="text-gray-500 text-base"
          selectedTextStyle="text-base"
          inputSearchStyle="h-10 text-base"
          iconStyle="w-5 h-5"
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
            <Feather name="globe" size={20} className="text-black" />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Languages;
