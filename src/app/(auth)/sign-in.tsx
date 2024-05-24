import {Image, StyleSheet, Alert, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import React, {useState} from 'react';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import {Link, Stack} from 'expo-router';
import {supabase} from "@/src/lib/supabase";
import GoogleSignIn from "@/src/components/google";

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function signInWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({email, password});
    if (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{title: 'Sign in'}}/>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo}/>
      <View style={styles.inputs}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={styles.input}
          secureTextEntry={!showPassword}
          right={<TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"}
            onPress={togglePasswordVisibility}
          />}
        />
      </View>
      <Link href={"/forgot"} style={styles.forgot}>
        <Text>Forgot Password</Text>
      </Link>
      <Button disabled={loading} onPress={signInWithEmail} text={loading ? "Signing in..." : "Sign in"}/>
      <Link href="/sign-up" style={styles.textButton}>
        Create an account
      </Link>
      <GoogleSignIn/>
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
  label: {
    color: 'gray',
  },
  inputs: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 14,
    height: 45,
  },
  textButton: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginVertical: 10,
  },
  logo: {
    height: 200,
    aspectRatio: 1,
    alignSelf: "center",
  },
  googleBtn: {
    backgroundColor: 'white',
    borderWidth: 0.5,
  },
  googleBtnText: {
    color: 'black',
  },
  forgot: {
    fontSize: 16,
    alignSelf: "flex-end",
    paddingVertical: 7,
  },
});

export default SignInScreen;
