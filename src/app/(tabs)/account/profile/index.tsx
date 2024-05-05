import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
import {Link, useNavigation} from "expo-router";
import {Feather} from "@expo/vector-icons";
import {useAuth} from "@/src/providers/AuthProvider";
import {useProfile} from "@/src/api/profiles";
import {ActivityIndicator} from "react-native-paper";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const {session} = useAuth();
  const {data: profile, isLoading, isError} = useProfile(session?.user.id)

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (isError) {
    return <Text>Failed to fetch data</Text>;
  }

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
        <Link href={`/account/profile/update`}>
          <Feather style={styles.icon} name={"edit"} size={24}/>
        </Link>
      </View>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.avatarContainer}>
        <Image
          source={profile?.avatar_url ? {uri: profile?.avatar_url} : require('@/assets/images/blank-profile.png')}
          style={styles.avatar}/>
      </View>
      <View style={styles.infoSection}>
        <View style={styles.transparent}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.info}>{profile?.full_name}</Text>
        </View>
        <View style={styles.transparent}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.info}>{session?.user.email}</Text>
        </View>
        <View style={styles.transparent}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.info}>{profile?.phone_number}</Text>
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
