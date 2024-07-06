import {Image, View, Text, Alert, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from "react";
import {supabase} from "@/src/lib/supabase";
import {ActivityIndicator, TextInput} from "react-native-paper";
import Button from '@/src/components/Button';
import {useNavigation} from "expo-router";
import {useAuth} from "@/src/providers/AuthProvider";
import {Feather} from "@expo/vector-icons";

const Password = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);

  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const {session} = useAuth();

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = () => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&_\-{}\[\]()#^<>.,:;"'~`|\\\/]{8,}$/;
    return passwordRegex.test(password);
  };

  const passwordsMatch = () => password === confirmPassword;

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

  if (loading) {
    return <ActivityIndicator/>;
  }

  async function changePassword() {
    if (!validatePassword()) {
      Alert.alert('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }
    if (passwordError || confirmPasswordError) {
      Alert.alert('Please fix the errors before proceeding.');
      return;
    }

    setLoading(true);
    // check if old password is correct
    const {error} = await supabase.auth.signInWithPassword({email: session?.user.email, password: oldPassword});
    if (error) {
      console.error('Server error:', error);
      Alert.alert('Error', 'Server error.');
    } else {
      // update new password
      const {error} = await supabase.auth.updateUser({password});
      setLoading(false);
      if (error) {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      } else {
        Alert.alert('Password is changed successfully');
        resetFields();
        navigation.goBack();
      }
    }
  }

  const resetFields = () => {
    setOldPassword('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <View className="p-4 bg-white flex-1 justify-center">
      <View className="absolute top-12 left-0 right-0 h-16 justify-center px-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={44}/>
        </TouchableOpacity>
      </View>
      <View className="flex items-center justify-center">
        <Image source={require('@/assets/images/logo.png')} className="h-60 w-60"/>
        <Text className="text-3xl font-semibold mb-4">Change Password</Text>
        <TextInput
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Old Password"
          className="w-full border-gray-300 border rounded-md px-2 mb-2 bg-white"
          secureTextEntry={!showOldPassword}
          right={
            <TextInput.Icon
              icon={showOldPassword ? "eye-off" : "eye"}
              onPress={toggleOldPasswordVisibility}
            />
          }
          error={!!passwordError}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New Password"
          className="w-full border-gray-300 border rounded-md px-2 mb-2 bg-white"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={togglePasswordVisibility}
            />
          }
          error={!!passwordError}
        />
        {passwordError && <Text className="text-red-600 text-sm mb-2">{passwordError}</Text>}
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm New Password"
          className="w-full border-gray-300 border rounded-md px-2 mb-2 bg-white"
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              onPress={toggleConfirmPasswordVisibility}
            />
          }
          error={!!confirmPasswordError}
        />
        {confirmPasswordError && <Text className="text-red-600 text-sm mb-2">{confirmPasswordError}</Text>}
        <Button
          disabled={loading}
          onPress={changePassword}
          text={loading ? "Submitting..." : "Submit"}
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-md mt-4 bg-black"
        />
      </View>
    </View>
  );
};

export default Password;
