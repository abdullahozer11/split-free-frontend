import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import ExpenseForm from "@/src/components/ExpenseForm";
import {useLocalSearchParams} from "expo-router";

export default function NewExpense() {
  const {id: idString} = useLocalSearchParams();
  const groupId = parseFloat(typeof idString === 'string' ? idString : idString[0]);

  return (
    <SafeAreaView style={styles.container}>
      <ExpenseForm title={"New Expense"} groupId={groupId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
