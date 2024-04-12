import {Image, StyleSheet, TextInput, Alert, View} from 'react-native';
import React, {useState} from 'react';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import {Link, Stack} from 'expo-router';
import {supabase} from "@/src/lib/supabase";
import Icon from 'react-native-vector-icons/FontAwesome';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  async function signInWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({email, password});
    if (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  }

  const signInWithGoogle = () => {
    setLoading(true);
    console.log("Sign in with google");
    setLoading(false);
  };

  const renderGoogleIcon = () => {
    return <Icon name="google" size={30} color="black"/>;
  };

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
          secureTextEntry
        />
      </View>
      <Button disabled={loading} onPress={signInWithEmail} text={loading ? "Signing in..." : "Sign in"}/>
      <Link href="/sign-up" style={styles.textButton}>
        Create an account
      </Link>
      <Button
        text={'Login with Google'}
        accessoryLeft={<Icon name="google" size={22} color="black"/>}
        onPress={signInWithGoogle} style={styles.googleBtn}
        textStyle={styles.googleBtnText}
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
  label: {
    color: 'gray',
  },
  inputs: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
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
  googleBtn: {
    backgroundColor: 'white',
    borderWidth: 0.5,
  },
  googleBtnText: {
    color: 'black',
  },
});

export default SignInScreen;
