import {Pressable, View} from 'react-native';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Feather} from '@expo/vector-icons';
import {supabase} from "@/src/lib/supabase";
import {Link, useNavigation} from "expo-router";
import {Text} from "react-native-paper";


const SettingsItem = ({page, iconName, title, containerColor}) => {
  return (
    <Link href={`/(tabs)/account/settings/${page}`} asChild>
      <Pressable className="flex-row justify-between items-center p-2">
        <View className="flex-row items-center gap-4">
          <View className={`w-14 h-14 rounded-md flex items-center justify-center`} style={{backgroundColor: containerColor}}>
            <Feather name={iconName} size={24}/>
          </View>
          <Text>{title}</Text>
        </View>
        <Feather name={"chevron-right"} size={28}/>
      </Pressable>
    </Link>
  );
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4 gap-4">
      <Pressable onPress={() => navigation.goBack()}>
        <Feather name="chevron-left" size={36} />
      </Pressable>
      <Text className="text-3xl font-semibold">Settings</Text>
      <View className="mt-4">
        <SettingsItem page="notifications" containerColor="blue" iconName="bell" title="Notifications" />
        <SettingsItem page="language" containerColor="darkorange" iconName="globe" title="Language" />
        <SettingsItem page="faq" containerColor="orange" iconName="help-circle" title="FAQ" />
        <SettingsItem page="terms" containerColor="blue" iconName="check" title="Terms of Use" />
        <SettingsItem page="password" containerColor="yellow" iconName="lock" title="Change Password" />
        <SettingsItem page="delete" containerColor="red" iconName="lock" title="Delete Account" />
      </View>
      <View className="absolute bottom-0 left-0 right-0 p-4 gap-2 mb-4">
        <Text onPress={handleSignOut} className="text-red-600 text-center text-2xl">
          Log out
        </Text>
        <Text className="text-gray-600 text-center">
          SplitFree 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
