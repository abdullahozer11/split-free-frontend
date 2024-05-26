import React from 'react';
import {Stack} from 'expo-router';

export default function TransferStack() {
  return (
    <Stack>
      <Stack.Screen name="create" options={{headerShown: false, title: 'New Transfer'}}/>
      <Stack.Screen name="[transfer_id]" options={{headerShown: false, title: 'Transfer Details'}}/>
    </Stack>
  );
}
