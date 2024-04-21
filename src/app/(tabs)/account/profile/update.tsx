import {Image, ScrollView, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
import {useAuth} from "@/src/providers/AuthProvider";
import {useState} from "react";
import {Link, useNavigation} from "expo-router";
import {Feather} from "@expo/vector-icons";

export default function UpdateProfile() {
  const {session, profile, loading} = useAuth();
  const [image, setImage] = useState('');
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather style={styles.icon} name={"arrow-left"} size={24}/>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.body}>
        <Text style={styles.title}>Update Profile</Text>
        <View style={styles.avatarContainer}>
          <Image
            source={profile.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}
            style={styles.avatar}/>
        </View>
        <Text onPress={pickImage} style={styles.textButton}> Select Image </Text>
        <View style={styles.inputSection}>
          <View style={styles.transparent}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              defaultValue={profile.full_name || "John Doe"}
              onChangeText={(text) => setFullName(text)}
            />
          </View>
          <View style={styles.transparent}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              defaultValue={profile.email || "john.doe@gmail.com"}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          <View style={styles.transparent}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              defaultValue={profile.phone_number || "+33 7 77 77 77 77"}
              onChangeText={(text) => setPhoneNumber(text)}
            />
          </View>
          <View style={styles.transparent}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setPassword(text)}
            />
            <TextInput
              style={styles.input}
              onChangeText={(text) => setPassword2(text)}
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
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: 'black',
    opacity: 0.7,
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
    fontSize: 30,
  },
  transparent: {
    backgroundColor: 'transparent',
    gap: 10,
    marginBottom: 10,
  },
});
