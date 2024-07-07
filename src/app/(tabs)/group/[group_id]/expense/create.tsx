import React from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import ExpenseForm from "@/src/components/ExpenseForm";
import {useLocalSearchParams} from "expo-router";

export default function NewExpense() {
  const {group_id: idString} = useLocalSearchParams();
  const groupId = parseInt(typeof idString === 'string' ? idString : idString[0]);

  return (
    <SafeAreaView className='flex-1 p-5'>
      <ExpenseForm title={"New Expense"} groupId={groupId} />
    </SafeAreaView>
  );
}
