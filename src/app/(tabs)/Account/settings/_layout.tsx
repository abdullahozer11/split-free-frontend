import React from 'react';
import {Stack} from 'expo-router';

export default function SettingsStack() {
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
