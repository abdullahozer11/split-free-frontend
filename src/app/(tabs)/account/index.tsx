import { View, Image, Pressable, TouchableOpacity } from "react-native";
import { Text, useTranslations } from "@/src/components/Translated";
import React, { type ComponentProps } from "react";
import { useAuth } from "@/src/providers/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useProfile } from "@/src/api/profiles";
import { profileQueryFallback } from "@/src/components/FetchError";

type AccountCardProps = {
  iconName: ComponentProps<typeof Feather>["name"];
  title: string;
  page: "profile" | "settings";
};

const Card = ({ iconName, title, page }: AccountCardProps) => {
  const { t } = useTranslations();
  return (
    <Link href={`/(tabs)/account/${page}`} asChild>
      <Pressable className="flex-1 mx-1 rounded-md border-2 border-gray-400 items-center bg-white justify-between py-5">
        <View />
        <Feather name={iconName} size={24} color="black" />
        <Text className="text-lg font-semibold text-black">{t(title)}</Text>
      </Pressable>
    </Link>
  );
};

const AccountScreen = () => {
  const navigation = useNavigation();
  const { session } = useAuth();
  const userId = session?.user.id ?? "";
  const { data: profile, isLoading, isError, refetch } = useProfile(userId);

  const profileFallback = profileQueryFallback({
    uid: userId,
    isLoading,
    isError,
    profile,
    refetch,
  });
  if (profileFallback) {
    return profileFallback;
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
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
        <View className="flex-1">
          <Text
            className="text-4xl font-medium"
            style={{ color: "#FFFFFF" }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {profile?.full_name}
          </Text>
          <Text
            className="text-md font-light"
            style={{ color: "#FFFFFF" }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {profile?.email}
          </Text>
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
