import React, {useEffect, useState} from "react";
import {TouchableOpacity, View} from "react-native";
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

  const {session, setSession} = useAuth();
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
    setSession(null);
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
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={36}/>
      </TouchableOpacity>
      <Text className="text-2xl font-semibold mb-6">Notifications</Text>
      <View className="bg-white rounded-md p-4 mb-4 flex-row justify-between items-center">
        <Text>Email Notifications</Text>
        <Switch
          value={emailNotifications}
          onValueChange={handleEmailNotifChange}
        />
      </View>
      <View className="bg-white rounded-md p-4 mb-4 flex-row justify-between items-center">
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
