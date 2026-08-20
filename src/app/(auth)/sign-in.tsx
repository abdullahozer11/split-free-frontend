import { Image, Alert, View } from "react-native";
import { Text } from "@/src/components/Translated";
import { TextInput } from "@/src/components/Translated";
import React, { useState } from "react";
import Button from "@/src/components/Button";
import KeyboardAvoidingScreen from "@/src/components/KeyboardAvoidingScreen";
import { StackScreen } from "@/src/components/Translated";
import { Link } from "@/src/components/Translated";
import { supabase } from "@/src/lib/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);

  const url = Linking.useURL();
  if (url) {
    createSessionFromUrl(url);
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function debugSupabaseAuth() {
    supabaseUrl = "http://192.168.1.151:54321";
    const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`; // Use your supabaseUrl var
    console.log("Debug: Attempting fetch to", authUrl);
    console.log("Debug: With email:", email); // Avoid logging password

    try {
      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "YOUR_SUPABASE_ANON_KEY",
          Authorization: `Bearer YOUR_SUPABASE_ANON_KEY`, // Optional, but include if required
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Debug: Response status:", response.status);
      console.log(
        "Debug: Response headers:",
        JSON.stringify(Object.fromEntries(response.headers), null, 2),
      );

      const rawText = await response.text(); // Always get text first
      console.log("Debug: Raw response body:", rawText); // This reveals HTML/errors like '<html>...'

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${rawText}`);
      }

      try {
        const json = JSON.parse(rawText);
        console.log("Debug: Parsed JSON:", JSON.stringify(json, null, 2));
        // If successful, handle session here
      } catch (parseErr) {
        console.error("Debug: JSON parse failed:", parseErr.message);
      }
    } catch (fetchErr) {
      console.error("Debug: Fetch error:", fetchErr.name, fetchErr.message);
      console.error("Debug: Full fetch error stack:", fetchErr.stack);
    }
  }

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      Alert.alert(error.message);
      console.log("signInWithEmail error is ", error.message);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingScreen>
      <StackScreen options={{ title: "Sign in" }} />
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
        />
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
        />
      </View>
      <Link href="/forgot" className="self-end py-1.5 text-lg">
        <Text>Forgot Password</Text>
      </Link>
      <Button
        disabled={loading}
        onPress={signInWithEmail}
        text={loading ? "Signing in..." : "Sign in"}
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
    </KeyboardAvoidingScreen>
  );
};

export default SignInScreen;
