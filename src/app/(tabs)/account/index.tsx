import { View, Text, Image, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "@/src/providers/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useProfile } from "@/src/api/profiles";
import { ActivityIndicator } from "react-native-paper";

const Card = ({ iconName, title, page }) => {
  return (
    <Link href={`/(tabs)/account/${page}`} asChild>
      <Pressable className="h-24 w-24 rounded-md border-2 border-gray-400 items-center bg-white justify-between py-5">
        <View />
        <Feather name={iconName} size={24} color="black" />
        <Text className="text-lg font-semibold text-black">{title}</Text>
      </Pressable>
    </Link>
  );
};

const AccountScreen = () => {
  const navigation = useNavigation();
  const { setSession, session } = useAuth();
  const { data: profile, isLoading, isError } = useProfile(session?.user.id);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    setSession(null);
    return <Text>Failed to fetch data</Text>;
  }

  return (
    <SafeAreaView className={"flex-1 bg-black"}>
      <View className="h-44 bg-black z-10 flex-row gap-4 px-6 items-center">
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Feather name={"arrow-left"} size={32} color={"white"} />
        </TouchableOpacity>
        <Image
          source={
            profile?.avatar_url
              ? { uri: profile.avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
          className="w-20 h-20 rounded-full"
        />
        <View>
          <Text className="text-4xl font-medium text-white">
            {profile.full_name}
          </Text>
          <Text className="text-md font-light text-white">{profile.email}</Text>
        </View>
      </View>
      <View className="bg-white flex-1 p-5">
        <View className="flex-row justify-between items-center px-2.5 mt-2.5">
          <Card iconName={"folder"} page={"profile"} title={"Profile"} />
          {/*<Card iconName={"pie-chart"} page={'spending'} title={"Spending"}/>*/}
          <Card iconName={"settings"} page={"settings"} title={"Settings"} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountScreen;
