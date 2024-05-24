import {View, StyleSheet, Alert, Image} from 'react-native';
import {TextInput, Text} from 'react-native-paper';
import React, {useState} from 'react';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import {Link, Stack, useRouter} from 'expo-router';
import {supabase} from "@/src/lib/supabase";
import {CheckBox} from "react-native-elements";

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptance, setAcceptance] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const router = useRouter();

  const validatePassword = () => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const passwordsMatch = () => password === confirmPassword;

  async function signUpWithEmail() {
    if (!passwordsMatch()) {
      Alert.alert('Passwords do not match.');
      return;
    }

    if (!validatePassword()) {
      Alert.alert('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setLoading(true);
    const {error} = await supabase.auth.signUp({email, password});
    setLoading(false);
    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Account created successfully!');
      router.push('/sign-in');
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
          keyboardType="email-address"
          autoCapitalize="none"
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
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          right={<TextInput.Icon
            icon={showConfirmPassword ? "eye-off" : "eye"}
            onPress={toggleConfirmPasswordVisibility}
          />}
        />
      </View>
      <View style={styles.termsContainer}>
        <CheckBox checked={acceptance} onPress={toggleAcceptance} />
        <Text>
          I agree to{' '}
          <Link href="/(global)/terms" style={{textDecorationLine: 'underline'}}>
            terms and conditions
          </Link>
        </Text>
      </View>
      <Button
        disabled={loading || !acceptance}
        onPress={signUpWithEmail}
        text={loading ? 'Creating account...' : 'Create account'}
      />
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
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 14,
    height: 45,
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
