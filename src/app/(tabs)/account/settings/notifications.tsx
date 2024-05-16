import React, {useEffect, useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {Text, Switch, ActivityIndicator} from "react-native-paper";
import {useAuth} from "@/src/providers/AuthProvider";
import {useProfile, useUpdateProfileSingleField} from "@/src/api/profiles";
import {Feather} from "@expo/vector-icons";
import {useNavigation} from "expo-router";

const Notifications = () => {
  const navigation = useNavigation();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [mobilePopups, setMobilePopups] = useState(false);

  const {session} = useAuth();
  const {data: profile, isLoading, isError} = useProfile(session?.user.id);

  const {mutate: updateProfileSF} = useUpdateProfileSingleField();

  useEffect(() => {
    setEmailNotifications(profile?.receive_emails);
    setMobilePopups(profile?.receive_popups);
  }, []);

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (isError) {
    return <Text>Failed to fetch data</Text>;
  }

  const handleEmailNotifChange = () => {
    const newValueTemp = !emailNotifications;
    setEmailNotifications(newValueTemp);
    updateProfileSF({
        id: profile?.id,
        field: 'receive_emails',
        value: !emailNotifications
      }, {
        onSuccess: () => {
          // console.log('handleEmailNotifChange success');
        },
        onError: () => {
          setEmailNotifications(!newValueTemp);
        }
      }
    );
  };

  const handlePopupChange = () => {
    const newValueTemp = !mobilePopups;
    setMobilePopups(newValueTemp);
    updateProfileSF({
        id: profile?.id,
        field: 'receive_popups',
        value: newValueTemp
      }, {
        onSuccess: () => {
          // console.log('handlePopupChange success');
        },
        onError: () => {
          setMobilePopups(!newValueTemp);
        }
      }
    );
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
