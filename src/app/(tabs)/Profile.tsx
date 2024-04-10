import { StyleSheet } from 'react-native';

import { View, Text } from '@/src/components/Themed';
import {supabase} from "@/src/lib/supabase";
import Button from '../../components/Button';

export default function ProfileScreen() {

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Button text='Sign Out' onPress={handleSignOut}/>
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
});
