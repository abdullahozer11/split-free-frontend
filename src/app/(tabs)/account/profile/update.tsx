import {Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
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

  const {session} = useAuth();
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
    return <Text>Failed to fetch data</Text>;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather style={styles.icon} name={"arrow-left"} size={24}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          handleSubmit();
        }}>
          <Text style={styles.icon}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.body}>
        <Text style={styles.title}>Update Profile</Text>
        <View style={styles.avatarContainer}>
          <Image
            source={profile?.avatar_url ? {uri: profile?.avatar_url} : require('@/assets/images/blank-profile.png')}
            style={styles.avatar}/>
        </View>
        {/*<Text onPress={pickImage} style={styles.pickImageButton}> Select Image </Text>*/}
        <View style={styles.inputSection}>
          <View style={styles.transparent}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={(text) => setFullName(text)}
            />
          </View>
          <View style={styles.transparent}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
            />
          </View>
          <View style={styles.transparent}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={(text) => setWebsite(text)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6FF',
    padding: 40,
    gap: 20,
  },
  header: {
    marginTop: 10,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 10,
  },
  pickImageButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: 'black',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    opacity: 0.6,
  },
  inputSection: {
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  input: {
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'white',
    height: 50,
    alignItems: "center",
    borderRadius: 10,
    paddingLeft: 10,
  },
  icon: {
    fontSize: 28,
    fontWeight: "400",
  },
  transparent: {
    backgroundColor: 'transparent',
    gap: 10,
    marginBottom: 10,
  },
});
