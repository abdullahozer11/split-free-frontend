import React from 'react';
import {Link, router, Stack} from 'expo-router';

export default function AccountStack() {
  return (
   <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Account' }} />
      <Stack.Screen name="profile_legacy" options={{ headerShown: false, title: 'Profile Legacy Code' }} />
      <Stack.Screen name="settings" options={{ headerShown: false, title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ headerShown: false, title: 'Profile' }} />
    </Stack>
  );
}
