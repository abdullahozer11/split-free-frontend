import React, {useEffect} from 'react';
import {Stack, useNavigation} from 'expo-router';

export default function SettingsStack() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      tabBarVisible: false, // why does this not work? fixme
    });
  }, [navigation]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false, title: 'Settings'}}/>
      {/*<Stack.Screen name="Notifications" options={{ headerShown: false, title: 'Account' }} />*/}
      {/*<Stack.Screen name="Currency" options={{ headerShown: false, title: 'Profile' }} />*/}
      {/*<Stack.Screen name="FAQ" options={{ headerShown: false, title: 'Settings' }} />*/}
      {/*<Stack.Screen name="Terms of use" options={{ headerShown: false, title: 'Settings' }} />*/}
    </Stack>
  );
}
