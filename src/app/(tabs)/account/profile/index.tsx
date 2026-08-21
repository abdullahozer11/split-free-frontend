import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/Translated";
import { Link, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/src/providers/AuthProvider";
import { useProfile } from "@/src/api/profiles";
import { profileQueryFallback } from "@/src/components/FetchError";

export default function ProfileScreen() {
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
    <View className="flex-1 bg-gray-100 p-10 gap-4 justify-center">
      <View className="flex-row justify-between items-center bg-gray-100 mb-5">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={32} />
        </TouchableOpacity>
        <Link href="/account/profile/update">
          <Feather name="edit" size={30} />
        </Link>
      </View>
      <View className="bg-gray-100">
        <Text className="text-2xl font-bold">Profile</Text>
        <View className="flex justify-center items-center bg-gray-100">
          <Image
            source={
              profile?.avatar_url
                ? { uri: profile?.avatar_url }
                : require("@/assets/images/blank-profile.png")
            }
            className={"w-48 h-48 rounded-full border-2 border-gray-300"}
          />
        </View>
        <View className="flex flex-col gap-2 bg-gray-100">
          <View className="bg-transparent">
            <Text className="text-sm font-semibold opacity-70">Email</Text>
            <Text className="text-lg font-bold">{profile?.email}</Text>
          </View>
          <View className="bg-transparent">
            <Text className="text-sm font-semibold opacity-70">Full name</Text>
            <Text className="text-lg font-bold">{profile?.full_name}</Text>
          </View>
          <View className="bg-transparent">
            <Text className="text-sm font-semibold opacity-70">
              Phone number
            </Text>
            <Text className="text-lg font-bold">{profile?.phone_number}</Text>
          </View>
          <View className="bg-transparent">
            <Text className="text-sm font-semibold opacity-70">Website</Text>
            <Text className="text-lg font-bold">{profile?.website}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
