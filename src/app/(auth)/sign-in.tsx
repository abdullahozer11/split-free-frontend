import {Image, Alert, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import React, {useState} from 'react';
import Button from '../../components/Button';
import {Link, Stack} from 'expo-router';
import {supabase} from "@/src/lib/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";

const createSessionFromUrl = async (url: string) => {
  const {params, errorCode} = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const {access_token, refresh_token} = params;

  if (!access_token) return;

  const {data, error} = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};


const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);

  const url = Linking.useURL();
  if (url) {
    createSessionFromUrl(url);
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function signInWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({email, password});
    if (error) {
      Alert.alert(error.message);
      console.log(error.message);
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Stack.Screen options={{title: 'Sign in'}}/>
      <Image source={require('@/assets/images/logo.png')} className="h-52 w-52 self-center"/>
      <View className="space-y-2.5">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          className="border border-gray-400 bg-white rounded-md text-sm h-11"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          className="border border-gray-400 bg-white rounded-md text-sm h-11"
          secureTextEntry={!showPassword}
          right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={togglePasswordVisibility}/>}
        />
      </View>
      <Link href="/forgot" className="self-end py-1.5 text-lg">
        <Text>Forgot Password</Text>
      </Link>
      <Button disabled={loading} onPress={signInWithEmail} text={loading ? "Signing in..." : "Sign in"}/>
      <Link href="/sign-up" className="self-center font-bold text-blue-500 my-2.5">
        Create an account
      </Link>
      <Link href="/magic" className="w-full border p-2.5 rounded-full text-center text-lg text-maroon border-gray-400">
        Send Magic
      </Link>
      {/* <GoogleSignIn /> */}
    </View>
  );
};

export default SignInScreen;
