import {View, TextInput, StyleSheet, Alert, Pressable, Text, Image} from 'react-native';
import React, {useState} from 'react';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import {Link, Stack, useRouter} from 'expo-router';
import {supabase} from "@/src/lib/supabase";
import {CheckBox} from "react-native-elements";


const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptance, setAcceptance] = useState(false);

  const router = useRouter();


  async function signUpWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signUp({email, password});
    setLoading(false);
    if (error) {
      Alert.alert(error.message);
    }
  }

  const toggleAcceptance = () => {
    setAcceptance(!acceptance);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{title: 'Sign up'}}/>
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
      <View style={styles.termsContainer}>
        <CheckBox checked={acceptance} onPress={toggleAcceptance} />
        <Text>
          I agree to{' '}
          <Link href="/terms" style={{textDecorationLine: 'underline'}}>
            terms
          </Link>{' '}
          and{' '}
          <Link href="/conditions" style={{textDecorationLine: 'underline'}}>
            conditions
          </Link>
        </Text>
      </View>
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
  },
  logo: {
    height: 200,
    aspectRatio: 1,
    alignSelf: "center",
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SignUpScreen;
