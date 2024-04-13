import {Image, ScrollView, StyleSheet} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';
import {useAuth} from "@/src/providers/AuthProvider";
import {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";

const CurrencyCard = ({currency}) => {
  return (
    <View style={styles.card}>
      <Text>{currency}</Text>
    </View>
  );
};

export default function ProfileScreen() {

  const {session, profile, loading} = useAuth();
  const [image, setImage] = useState('');

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'TRY'];

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
    <SafeAreaView style={styles.container}>
      <Image
        source={profile?.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}
        style={styles.avatar}/>
      <Text style={{}}>Select Image </Text>
      <Text style={styles.nameTitle}>FULL NAME</Text>
      <View style={styles.nameBox}>
        <Text style={styles.name}>{profile?.full_name || 'John Doe'}</Text>
      </View>
      <Text style={{}}>Select Primary Currency</Text>
      <Text style={{}}>Don't worry! You can change it.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {currencies.map((currency, index) => (
          <CurrencyCard key={index} currency={currency}/>
        ))}
      </ScrollView>

      <Button text="I'm Done" onPress={() => {
        console.log('DONE');
      }}/>
      <Button text="Sign Out" onPress={handleSignOut}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 60,
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
  nameBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  nameTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    marginRight: 10,
    borderRadius: 10,
    height: 100,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});
