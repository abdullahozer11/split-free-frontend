import {Image, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import React, {useState, useEffect} from 'react';
import Button from '../../components/Button';
import {Stack} from 'expo-router';
import {supabase} from "@/src/lib/supabase";
import {makeRedirectUri} from "expo-auth-session";

const redirectTo = makeRedirectUri();

const MagicScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Send Magic Link');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      setButtonText('Send Magic Link');
    }
    return () => clearInterval(timer);
  }, [countdown]);

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
      setButtonText('Resend Magic Link in 60s');
      setCountdown(5);
    } catch (error) {
      // handle error (e.g., show error message)
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Stack.Screen options={{title: 'Magic Link'}}/>
      <Image source={require('@/assets/images/logo.png')} className="h-52 w-52 self-center"/>
      <View className="space-y-2.5">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          className="border border-gray-400 bg-white rounded-md text-sm h-11"
        />
      </View>
      <Button
        disabled={loading || countdown > 0}
        onPress={sendMagicLink}
        text={loading ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : buttonText}
      />
    </View>
  );
};

export default MagicScreen;
