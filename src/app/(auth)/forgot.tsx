import {View, Alert, Image} from 'react-native';
import {TextInput} from 'react-native-paper';
import React, {useState, useEffect} from 'react';
import Button from '../../components/Button';
import {Link, Stack, useRouter} from 'expo-router';
import {supabase} from "@/src/lib/supabase";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Send Reset Link');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      setButtonText('Send Reset Link');
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function resetPassword() {
    if (!email) {
      Alert.alert('Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://splitfree.xyz/update-password',
    });
    setLoading(false);

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('If this email is registered, you will receive a password reset link.');
      setButtonText('Resend Reset Link in 60s');
      setCountdown(60);
      router.push('/sign-in');
    }
  }

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Stack.Screen options={{title: 'Forgot Password'}}/>
      <Image source={require('@/assets/images/logo.png')} className="h-52 w-52 self-center"/>
      <View className="space-y-2.5">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          className="border border-gray-400 bg-white rounded-md text-sm h-11"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <Button
        disabled={loading || countdown > 0}
        onPress={resetPassword}
        text={loading ? 'Sending reset link...' : countdown > 0 ? `Resend in ${countdown}s` : buttonText}
      />
      <Link href="/sign-in" className="self-center font-bold text-blue-500">
        Back to Sign in
      </Link>
    </View>
  );
};

export default ForgotPasswordScreen;
