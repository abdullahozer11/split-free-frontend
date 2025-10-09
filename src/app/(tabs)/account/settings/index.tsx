import { Pressable, View } from "react-native";
import { Button, Text, useTranslatedAlert } from "@/src/components/Translated";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase";
import { Link, useNavigation } from "expo-router";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider.js";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useAuth} from "@/src/providers/AuthProvider";

const ANCHORED_GROUPS_STORAGE_KEY = "anchoredGroupIds";

const SettingsItem = ({page, iconName, title, containerColor}) => {
  const {settings} = useSettings();
  const int = translations[settings.language] || translations.en;
  return (
    <Link href={`/(tabs)/account/settings/${page}`} asChild>
      <Pressable className="flex-row justify-between items-center p-2">
        <View className="flex-row items-center gap-4">
          <View
            className={`w-14 h-14 rounded-md flex items-center justify-center`}
            style={{backgroundColor: containerColor}}
          >
            <Feather name={iconName} size={24}/>
          </View>
          <Text>{int[title] || title}</Text>
        </View>
        <Feather name={"chevron-right"} size={28}/>
      </Pressable>
    </Link>
  );
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const {alert} = useTranslatedAlert();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const handleSignOut = async () => {
    const {data: {user}} = await supabase.auth.getUser();
    if (user?.is_anonymous) {
      alert(
        "Warning",
        "You are signed in as an anonymous user. Signing out will result in permanent loss of your local data and is irreversible. Are you sure you want to sign out?", // This key will be translated via t(...)
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign Out",
            onPress: async () => {
              // Clear ALL React Query caches for anonymous users
              await queryClient.clear();

              // Clear AsyncStorage data (like anchored groups)
              try {
                await AsyncStorage.multiRemove([
                  ANCHORED_GROUPS_STORAGE_KEY,
                ]);
              } catch (error) {
                console.error("Error clearing AsyncStorage:", error);
              }
              // Sign out
              await supabase.auth.signOut();
            },
            style: "destructive",
          },
        ]
      );
    } else {
      await supabase.auth.signOut();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4 gap-4">
      <Pressable onPress={() => navigation.goBack()}>
        <Feather name="chevron-left" size={36}/>
      </Pressable>
      <Text className="text-3xl font-semibold">Settings</Text>
      <View className="mt-4">
        {/*<SettingsItem*/}
        {/*  page="notifications"*/}
        {/*  containerColor="blue"*/}
        {/*  iconName="bell"*/}
        {/*  title="Notifications"*/}
        {/*/>*/}
        <SettingsItem
          page="language"
          containerColor="darkorange"
          iconName="globe"
          title="Language"
        />
        <SettingsItem
          page="faq"
          containerColor="orange"
          iconName="help-circle"
          title="FAQ"
        />
        <SettingsItem
          page="terms"
          containerColor="blue"
          iconName="check"
          title="Terms of Use"
        />
        {!session?.user?.is_anonymous && <SettingsItem
          page="password"
          containerColor="yellow"
          iconName="lock"
          title="Change Password"
        />}
        <SettingsItem
          page="delete"
          containerColor="red"
          iconName="lock"
          title="DELETE ACCOUNT"
        />
      </View>
      <View className="absolute bottom-0 left-0 right-0 p-4 gap-2 mb-4">
        <Button
          onPress={handleSignOut}
          className="text-red-600 text-center text-2xl"
        >
          Log out
        </Button>
        <Text className="text-gray-600 text-center">SplitFree 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
