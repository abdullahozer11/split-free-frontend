import { View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import React, { useState } from 'react';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Link, Stack, useRouter } from 'expo-router';
import { supabase } from "@/src/lib/supabase";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email) => {
    // Simple regex for basic email validation
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://splitfree.xyz/update-password',
    })
    setLoading(false);

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('If this email is registered, you will receive a password reset link.');
      router.push('/sign-in');
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Forgot Password' }} />
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <View style={styles.inputs}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <Button
        disabled={loading}
        onPress={resetPassword}
        text={loading ? 'Sending reset link...' : 'Send Reset Link'}
      />
      <Link href="/sign-in" style={styles.textButton}>
        Back to Sign in
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
});

export default ForgotPasswordScreen;
