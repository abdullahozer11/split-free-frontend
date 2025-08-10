import {Image, View} from "react-native";
import {Text, useTranslatedAlert, useTranslations} from "@/src/components/Translated";
import {TextInput} from "@/src/components/Translated";
import React, {useState} from "react";
import Button from "@/src/components/Button";
import {Link} from "@/src/components/Translated";
import {supabase} from "@/src/lib/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";

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
  const { alert } = useTranslatedAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingAnon, setLoadingAnon] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const url = Linking.useURL();
  if (url) {
    createSessionFromUrl(url);
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    // Email validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  async function signInAnonymously() {
    setLoadingAnon(true);
    const { data: { session }, error } = await supabase.auth.signInAnonymously();
    if (error) {
      alert(error.message);
    }
    setLoadingAnon(false);
  }

  async function signInWithEmail() {
    if (!validateInputs()) return;

    setLoadingEmail(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
      console.log("signInWithEmail error is ", error.message);
    }
    setLoadingEmail(false);
  }

  const { t } = useTranslations();

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Stack.Screen options={{title: t("Sign in")}}/>
      <Image
        source={require("@/assets/images/logo.png")}
        className="h-52 w-52 self-center"
      />
      <View className="space-y-2.5">
        <View>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
            }}
            placeholder="Email"
            className={`border ${emailError ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md text-sm h-11`}
          />
          {emailError ? <Text className="text-red-500 text-sm mt-1">{emailError}</Text> : null}
        </View>
        <View>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError("");
            }}
            placeholder="Password"
            className={`border ${passwordError ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md text-sm h-11`}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={togglePasswordVisibility}
              />
            }
          />
          {passwordError ? <Text className="text-red-500 text-sm mt-1">{passwordError}</Text> : null}
        </View>
      </View>
      <Link href="/forgot" className="self-end py-1.5 text-lg">
        <Text>Forgot Password</Text>
      </Link>
      <Button
        disabled={loadingEmail || !!emailError || !!passwordError}
        onPress={signInWithEmail}
        text={loadingEmail ? "Signing in..." : "Sign in"}
      />
      <Button
        disabled={loadingAnon}
        onPress={signInAnonymously}
        text={loadingAnon ? "Signing in anonymously..." : "Try Anonymously"}
      />
      <Link
        href="/sign-up"
        className="self-center font-bold text-blue-500 my-2.5"
      >
        Create account
      </Link>
      <Link
        href="/magic"
        className="w-full border p-2.5 rounded-full text-center text-lg text-maroon border-gray-400"
      >
        Send Magic Link
      </Link>
      {/* <GoogleSignIn /> */}
    </View>
  );
};

export default SignInScreen;
