import { View, Alert, Image } from "react-native";
import { TextInput } from "@/src/components/Translated";
import React, { useState } from "react";
import Button from "@/src/components/Button";
import KeyboardAvoidingScreen from "@/src/components/KeyboardAvoidingScreen";
import { useRouter } from "expo-router";
import { StackScreen } from "@/src/components/Translated";
import { supabase } from "@/src/lib/supabase";

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = () => {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&_\-{}\[\]()#^<>.,:;"'~`|\\\/]{8,}$/;
    return passwordRegex.test(password);
  };

  const passwordsMatch = () => password === confirmPassword;

  async function resetPassword() {
    if (!passwordsMatch()) {
      Alert.alert("Passwords do not match.");
      return;
    }

    if (!validatePassword()) {
      Alert.alert(
        "Password must be at least 8 characters long and contain both letters and numbers.",
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert("Password has been reset successfully!");
      router.push("/sign-in");
    }
  }

  return (
    <KeyboardAvoidingScreen>
      <StackScreen options={{ title: "Reset Password" }} />
      <Image
        source={require("@/assets/images/logo.png")}
        className="h-[200px] aspect-square self-center"
      />
      <View style={{ gap: 10 }}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New Password"
          className="border-[1px] border-gray-300 bg-white rounded-[5px] h-[45px] text-[14px]"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={togglePasswordVisibility}
            />
          }
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm New Password"
          className="border-[1px] border-gray-300 bg-white rounded-[5px] h-[45px] text-[14px]"
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              onPress={toggleConfirmPasswordVisibility}
            />
          }
        />
      </View>
      <Button
        disabled={loading}
        onPress={resetPassword}
        text={loading ? "Resetting password..." : "Reset Password"}
      />
    </KeyboardAvoidingScreen>
  );
};

export default ResetPasswordScreen;
