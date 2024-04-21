import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
import {useAuth} from "@/src/providers/AuthProvider";
import {Link, useNavigation} from "expo-router";
import {Feather} from "@expo/vector-icons";

export default function ProfileScreen() {
  const {session, profile, loading} = useAuth();
  const navigation = useNavigation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather style={styles.icon} name={"x"} size={24}/>
        </TouchableOpacity>
        <Link href={'account/profile/update'}  >
          <Feather style={styles.icon} name={"edit"} size={24}/>
        </Link>
      </View>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.avatarContainer}>
        <Image
          source={profile.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}
          style={styles.avatar}/>
      </View>
      <View style={styles.infoSection}>
        <View style={styles.transparent}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.info}>{profile.full_name || "John Doe"}</Text>
        </View>
        <View style={styles.transparent}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.info}>{profile.email || "john.doe@gmail.com"}</Text>
        </View>
        <View style={styles.transparent}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.info}>{profile.phone_number || "+33 7 77 77 77 77"}</Text>
        </View>
        <View style={styles.transparent}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.info}>********</Text>
        </View>
      </View>
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
  title: {
    fontSize: 36,
    fontWeight: 'bold',
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
  },
  infoSection: {
    flex: 1,
    backgroundColor: 'transparent',
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  info: {
    fontSize: 16,
    fontWeight: '700',
  },
  icon: {
    fontSize: 30,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
});
