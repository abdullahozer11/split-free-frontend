import React from "react";
import Button from "@/src/components/Button";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Icon from "react-native-vector-icons/FontAwesome";
import { supabase } from "@/src/lib/supabase";

GoogleSignin.configure({
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  webClientId:
    "234861951748-idgdg76uero5ldcai899vegbm1nmdedc.apps.googleusercontent.com",
});

const GoogleSignIn = () => {
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("userInfo is", userInfo);
      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.idToken,
        });
        console.log(error, data);
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("user cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("operation (e.g. sign in) is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("play services not available or outdated");
      } else {
        console.log("some other error happened:", error);
      }
    }
  };

  return (
    <Button
      text={"Login with Google"}
      accessoryLeft={<Icon name="google" size={22} color="black" />}
      onPress={signInWithGoogle}
      className={"bg-white rounded-md]"}
      textStyle={{ color: "black" }}
    />
  );
};

export default GoogleSignIn;
