import {View, StyleSheet, Alert, Image} from 'react-native';
import {TextInput, Text} from 'react-native-paper';
import React, {useState, useEffect} from 'react';
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

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(email) ? '' : 'Invalid email address.');
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (password.length > 0) {
      setPasswordError(validatePassword() ? '' : 'Password must be at least 8 characters long and contain both letters and numbers.');
    } else {
      setPasswordError('');
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setConfirmPasswordError(passwordsMatch() ? '' : 'Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  }, [confirmPassword]);

  async function signUpWithEmail() {
    if (emailError || passwordError || confirmPasswordError) {
      Alert.alert('Please fix the errors before proceeding.');
      return;
    }

    setLoading(true);
    const {error} = await supabase.auth.signUp({email, password});
    setLoading(false);
    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Confirm account via email');
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
          error={!!emailError}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
          error={!!passwordError}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
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
          error={!!confirmPasswordError}
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
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
