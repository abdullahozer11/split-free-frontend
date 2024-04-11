import {Image, StyleSheet} from 'react-native';

import {View, Text} from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import Button from '../../components/Button';
import {useAuth} from "@/src/providers/AuthProvider";

export default function ProfileScreen() {

  const {session, profile, loading} = useAuth();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      <Image source={{uri: profile?.avatar_url}} style={styles.avatar}/>
      {/*add fallback*/}
      <Text style={styles.name}>{profile?.full_name || 'John Doe' }</Text>
      <Button text="Sign Out" onPress={handleSignOut}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#0099ff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});
