import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import ExpenseForm from "@/src/components/ExpenseForm";
import {useLocalSearchParams} from "expo-router";
import {useExpense} from "@/src/api/expenses";
import {ActivityIndicator} from "react-native-paper";

export default function UpdateExpense() {
  const { id } = useLocalSearchParams();

  const {data: expense, error: expenseError, isLoading: expenseLoading} = useExpense(id);

  if (expenseLoading) {
    return <ActivityIndicator/>;
  }

  if (expenseError) {
    return <Text>Failed to fetch data</Text>;
  }

  const new_expense = {
    ...expense,
    payers: expense?.expense_payers?.map(payer => (payer.member)),
    participants: expense?.expense_participants?.map(participant => (participant.member)),
  }
  delete new_expense.expense_payers;
  delete new_expense.expense_participants;

  return (
    <SafeAreaView style={styles.container}>
      <ExpenseForm title={"Update Expense"} updatingExpense={new_expense}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
