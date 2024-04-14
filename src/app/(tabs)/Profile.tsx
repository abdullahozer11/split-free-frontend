import {Image, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';
import {useAuth} from "@/src/providers/AuthProvider";
import {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import CurrencyCard from "@/src/components/CurrencyItem";
import {useNavigation} from "expo-router";

export default function ProfileScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD'); // should be dynamic
  const {session, profile, loading} = useAuth();
  const [image, setImage] = useState('');

  // const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'TRY'];
  const currencies = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': '$',
    'AUD': '$',
    'CHF': 'r',
    'CNY': '¥',
    'TRY': '₺'
  };

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

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button text="Done" onPress={() => {
          navigation.goBack();
        }}/>
        <Button text="Sign Out" onPress={handleSignOut}/>
      </View>
      <Image
        source={profile?.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}
        style={styles.avatar}/>
      <Text style={styles.imageSelector}>Select Image </Text>
      <Text style={styles.nameTitle}>FULL NAME</Text>
      <View style={styles.nameBox}>
        <Text style={styles.name}>{profile?.full_name || "No Name"}</Text>
      </View>
      <Text style={{}}>Select Primary Currency</Text>
      <Text style={{}}>Don't worry! You can change it.</Text>
      <ScrollView
        style={styles.scrollView}
        horizontal showsHorizontalScrollIndicator={false}
      >
        {Object.entries(currencies).map(([currencyCode, currencySymbol]) => (
          <TouchableOpacity
            key={currencyCode}
            onPress={() => setSelectedCurrency(currencyCode)}
            style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}
          >
            <CurrencyCard
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              selected={currencyCode === selectedCurrency}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
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
  imageSelector: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  scrollView: {
    marginHorizontal: 5,
  },
  header: {
    backgroundColor: 'black',
    width: '100%',
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 40,
    paddingTop: 40,
  },
});
