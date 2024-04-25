import React from 'react';
import {Stack} from 'expo-router';

export default function ExpenseStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false, title: 'Expense'}}/>
      <Stack.Screen name="[id]" options={{headerShown: false, title: 'Expense Details'}}/>
    </Stack>
  );
}
