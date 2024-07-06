import {Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {useEffect, useState} from "react";
import {useNavigation} from "expo-router";
import {Feather} from "@expo/vector-icons";
import {useProfile, useUpdateProfile} from "@/src/api/profiles";
import {useAuth} from "@/src/providers/AuthProvider";
import {ActivityIndicator} from "react-native-paper";
import {useQueryClient} from "@tanstack/react-query";

export default function UpdateProfile() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [image, setImage] = useState('');
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const {mutate: updateProfile} = useUpdateProfile();

  const {setSession, session} = useAuth();
  const {data: profile, isLoading, isError} = useProfile(session?.user.id);

  useEffect(() => {
    setFullName(profile?.full_name);
    setWebsite(profile?.website);
    setPhoneNumber(profile?.phone_number);
    setImage(profile?.avatar_url);
  }, [profile]);

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (isError) {
    setSession(null);
    return <Text>Failed to fetch data</Text>;
  }

  const handleSubmit = () => {
    updateProfile({
      id: profile?.id,
      full_name: fullName,
      website: website,
      phone_number: phoneNumber,
      avatar_url: image,
    }, {
      onSuccess: async () => {
        navigation.goBack();
        await queryClient.invalidateQueries(['profile']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  return (
    <View className="flex-1 bg-gray-100 p-10 justify-center">
      <View className="flex-row justify-between items-center mt-10 bg-transparent mb-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={32} className="text-black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit}>
          <Text className="text-black text-3xl">Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1">
        <Text className="text-4xl mb-4 text-center">Update Profile</Text>
        <View className="items-center bg-transparent">
          <Image
            source={profile?.avatar_url ? {uri: profile?.avatar_url} : require('@/assets/images/blank-profile.png')}
            className={"w-48 h-48 rounded-full border-2 border-gray-300"}
          />
        </View>
        <View className="mt-4 bg-transparent">
          <View className="bg-transparent mb-2">
            <Text className="text-sm font-semibold opacity-70">Full Name</Text>
            <TextInput
              className={"bg-white text-black h-12 rounded-md px-4"}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View className="bg-transparent mb-2">
            <Text className="text-sm font-semibold opacity-70">Phone Number</Text>
            <TextInput
              className={"bg-white text-black h-12 rounded-md px-4"}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
          <View className="bg-transparent mb-2">
            <Text className="text-sm font-semibold opacity-70">Website</Text>
            <TextInput
              className={"bg-white text-black h-12 rounded-md px-4"}
              value={website}
              onChangeText={setWebsite}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
