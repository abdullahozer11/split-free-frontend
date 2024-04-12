import {Image, StyleSheet} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';
import {useAuth} from "@/src/providers/AuthProvider";
import {useState} from "react";

export default function ProfileScreen() {

  const {session, profile, loading} = useAuth();
  const [image, setImage] = useState('');

  // const {mutate: updateProfile} = useUpdateProfile();
  // const {mutate: deleteProfile} = useDeleteProfile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
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
      <Text style={styles.name}>{profile?.full_name || 'John Doe'}</Text>
      <Image
        source={profile?.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}
        style={styles.avatar}/>
      <Text onPress={pickImage} style={styles.textButton}> Select Image </Text>
      <View style={styles.btnRow}>
        <Button text="Edit" onPress={() => {}} style={styles.editBtn} textStyle={styles.editBtnText}/>
        <Button text="Sign Out" onPress={handleSignOut}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#eee',
  },
  name: {
    fontSize: 32,
    fontWeight: '600',
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "500",
  },
  editBtn: {
    backgroundColor: 'white',
  },
  editBtnText: {
    color: 'black',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent:'space-between',
    width: '60%',
  }
});
