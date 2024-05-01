import React from 'react';
import {Stack} from 'expo-router';

export default function ExpenseStack() {
  return (
    <Stack>
      <Stack.Screen name="create" options={{headerShown: false, title: 'New Expense'}}/>
      <Stack.Screen name="[expense_id]" options={{headerShown: false, title: 'Expense Details'}}/>
    </Stack>
  );
}
