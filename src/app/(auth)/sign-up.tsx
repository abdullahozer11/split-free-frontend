import {View, TextInput, StyleSheet, Alert, Image} from 'react-native';
import React, {useState} from 'react';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import {Link, Stack, useRouter} from 'expo-router';
import {supabase} from "@/src/lib/supabase";


const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signUp({email, password});
    setLoading(false);
    if (error) {
      Alert.alert(error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{title: 'Sign up'}}/>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo}/>
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
        secureTextEntry
      />
      <Button disabled={loading} onPress={signUpWithEmail} text={loading ? 'Creating account...' : "Create account"}/>
      <Link href="/sign-in" style={styles.textButton}>
        Sign in
      </Link>
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
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
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
});

export default SignUpScreen;
