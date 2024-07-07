import { View, Alert, Image } from "react-native";
import { TextInput, Text } from "react-native-paper";
import React, { useState, useEffect } from "react";
import Button from "@/src/components/Button";
import { Link, Stack, useRouter } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { CheckBox } from "react-native-elements";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptance, setAcceptance] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const router = useRouter();

  const validatePassword = useCallback(() => {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&_\-{}\[\]()#^<>.,:;"'~`|\\\/]{8,}$/;
    return passwordRegex.test(password);
  }, [password]);

  const passwordsMatch = useCallback(() => {
    return password === confirmPassword;
  }, [password, confirmPassword]);

  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(email) ? "" : "Invalid email address.");
    } else {
      setEmailError("");
    }
  }, [email]);

  useEffect(() => {
    if (password.length > 0) {
      setPasswordError(
        validatePassword()
          ? ""
          : "Password must be at least 8 characters long and contain both letters and numbers.",
      );
    } else {
      setPasswordError("");
    }
  }, [password, validatePassword]);

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setConfirmPasswordError(
        passwordsMatch() ? "" : "Passwords do not match.",
      );
    } else {
      setConfirmPasswordError("");
    }
  }, [confirmPassword, passwordsMatch]);

  async function signUpWithEmail() {
    if (emailError || passwordError || confirmPasswordError) {
      Alert.alert("Please fix the errors before proceeding.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert("Confirm account via email");
      router.push("/sign-in");
    }
  }

  const toggleAcceptance = () => {
    setAcceptance(!acceptance);
  };

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Stack.Screen options={{ title: "Sign up" }} />
      <Image
        source={require("@/assets/images/logo.png")}
        className="h-52 w-52 self-center"
      />
      <View className="space-y-2.5">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          className="border border-gray-400 bg-white rounded-md text-sm h-11"
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!emailError}
        />
        {emailError ? (
          <Text className="text-red-500 text-xs mt-1 mb-2">{emailError}</Text>
        ) : null}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          className="border border-gray-400 bg-white rounded-md text-sm h-11"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={togglePasswordVisibility}
            />
          }
          error={!!passwordError}
        />
        {passwordError ? (
          <Text className="text-red-500 text-xs mt-1 mb-2">
            {passwordError}
          </Text>
        ) : null}
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          className="border border-gray-400 bg-white rounded-md text-sm h-11"
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              onPress={toggleConfirmPasswordVisibility}
            />
          }
          error={!!confirmPasswordError}
        />
        {confirmPasswordError ? (
          <Text className="text-red-500 text-xs mt-1 mb-2">
            {confirmPasswordError}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center">
        <CheckBox checked={acceptance} onPress={toggleAcceptance} />
        <Text>
          I agree to{" "}
          <Link href="/(global)/terms" className="underline">
            terms and conditions
          </Link>
        </Text>
      </View>
      <Button
        disabled={loading || !acceptance}
        onPress={signUpWithEmail}
        text={loading ? "Creating account..." : "Create account"}
      />
      <Link href="/sign-in" className="self-center font-bold text-blue-500">
        Sign in
      </Link>
    </View>
  );
};

export default SignUpScreen;
