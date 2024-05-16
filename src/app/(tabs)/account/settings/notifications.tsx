import React, {useEffect, useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {Text, Switch, ActivityIndicator} from "react-native-paper";
import {useAuth} from "@/src/providers/AuthProvider";
import {useProfile} from "@/src/api/profiles";
import {supabase} from "@/src/lib/supabase";
import {Feather} from "@expo/vector-icons";
import {useNavigation} from "expo-router";

const Notifications = () => {
  const navigation = useNavigation();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [mobilePopups, setMobilePopups] = useState(false);

  const {session} = useAuth();
  const {data: profile, isLoading, isError} = useProfile(session?.user.id);

  useEffect(() => {
    setEmailNotifications(profile?.receive_emails);
    setMobilePopups(profile?.receive_popups);
  }, [profile]);

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (isError) {
    return <Text>Failed to fetch data</Text>;
  }

  const handleEmailNotifChange = async () => {
    const {error} = await supabase
      .from('profiles')
      .update({
        receive_emails: !emailNotifications
      })
      .eq('id', profile?.id);
    if (error) {
      console.log('handleEmailNotifChange error: ', error);
      throw new Error(error.message);
    }
    console.log('handleEmailNotifChange success')
    setEmailNotifications(!emailNotifications);
  };

  const handlePopupChange = async () => {
    const {error} = await supabase
      .from('profiles')
      .update({
        receive_popups: !mobilePopups
      })
      .eq('id', profile?.id);
    if (error) {
      console.log('handlePopupChange error', error);
      throw new Error(error.message);
    }
    console.log('handlePopupChange success')
    setMobilePopups(!mobilePopups);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => {navigation.goBack()}}>
          <Feather name={"arrow-left"} size={36}/>
        </TouchableOpacity>
      <Text variant="headlineLarge" style={styles.title}>Notifications</Text>
      <View style={styles.setting}>
        <Text>Email Notifications</Text>
        <Switch
          value={emailNotifications}
          onValueChange={handleEmailNotifChange}
        />
      </View>
      <View style={styles.setting}>
        <Text>Mobile Popups</Text>
        <Switch
          value={mobilePopups}
          onValueChange={handlePopupChange}
        />
      </View>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F6F6F6FF',
  },
  title: {
    marginBottom: 24,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
});
