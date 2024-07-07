import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ExpenseForm from "@/src/components/ExpenseForm";
import { useLocalSearchParams } from "expo-router";
import { Text, ActivityIndicator } from "react-native-paper";
import { useExpense } from "@/src/api/expenses";

export default function UpdateExpense() {
  const { group_id: groupIdString, expense_id: expenseIdString } =
    useLocalSearchParams();
  const expenseId = parseInt(
    typeof expenseIdString === "string" ? expenseIdString : expenseIdString[0],
  );
  const group_id = parseInt(
    typeof groupIdString === "string" ? groupIdString : groupIdString[0],
  );

  const {
    data: expense,
    isError: expenseError,
    isLoading: expenseLoading,
  } = useExpense(expenseId);

  if (expenseLoading) {
    return <ActivityIndicator />;
  }

  if (expenseError) {
    return <Text>Failed to fetch data</Text>;
  }

  return (
    <SafeAreaView className="flex-1 p-5">
      <ExpenseForm
        title={"Update Expense"}
        groupId={group_id}
        updatingExpense={expense}
      />
    </SafeAreaView>
  );
}
