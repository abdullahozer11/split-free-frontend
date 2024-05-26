import React from 'react';
import {Stack} from 'expo-router';

export default function TransferStack() {
  return (
    <Stack>
      <Stack.Screen name="details" options={{headerShown: false, title: 'Transfer Details'}}/>
      <Stack.Screen name="update" options={{headerShown: false, title: 'Update Transfer'}}/>
    </Stack>
  );
}
