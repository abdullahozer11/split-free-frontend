import { Image, TouchableOpacity } from "react-native";
import { View, Text } from "@/src/components/Themed";
import { Link, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/src/providers/AuthProvider";
import { useProfile } from "@/src/api/profiles";
import { ActivityIndicator } from "react-native-paper";

export default function ProfileScreen() {
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
            <Text className="text-sm font-semibold opacity-70">Full Name</Text>
            <Text className="text-lg font-bold">{profile?.full_name}</Text>
          </View>
          <View className="bg-transparent">
            <Text className="text-sm font-semibold opacity-70">
              Phone Number
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
