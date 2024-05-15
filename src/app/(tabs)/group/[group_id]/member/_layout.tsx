import React from 'react';
import {Stack} from 'expo-router';

export default function MemberStack() {
  return (
    <Stack>
      <Stack.Screen name="create" options={{headerShown: false, title: 'New Member'}}/>
      <Stack.Screen name="[member_id]" options={{headerShown: false, title: 'Member Details'}}/>
    </Stack>
  );
}
