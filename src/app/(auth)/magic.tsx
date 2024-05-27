import {Image, StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import React, {useState} from 'react';
import Button from '../../components/Button';
import {Stack} from 'expo-router';
import {supabase} from "@/src/lib/supabase";
import {makeRedirectUri} from "expo-auth-session";

const redirectTo = makeRedirectUri();

const MagicScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Send Magic Link');

  const sendMagicLink = async () => {
    setLoading(true);
    try {
      const {error} = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      setButtonText('Resend Magic Link');
    } catch (error) {
      // handle error (e.g., show error message)
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{title: 'Magic Link'}}/>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo}/>
      <View style={styles.inputs}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
        />
      </View>
      <Button
        disabled={loading}
        onPress={sendMagicLink}
        text={loading ? "Sending..." : buttonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
  inputs: {
    gap: 10,
  },
  logo: {
    height: 200,
    aspectRatio: 1,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 14,
    height: 45,
  },
});

export default MagicScreen;
