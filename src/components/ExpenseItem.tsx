import {StyleSheet, View, Text, Pressable} from 'react-native';
import React from "react";
import {MaterialIcons} from "@expo/vector-icons";
import {Link} from "expo-router";
import {exp_cat} from "@/src/utils/expense_categories";

const ExpenseItem = ({expense}) => {
  return (
    <Link href={`/(tabs)/group/${expense.group_id}/expense/${expense.id}/details`} asChild>
      <Pressable style={styles.expenseItem}>
        <View style={styles.expenseCatIcon}>
          <MaterialIcons name={exp_cat[expense.category ?? 'shopping-cart']} style={styles.icon}/>
        </View>
        <Text style={{fontSize: 18, fontWeight: '600', width: 200}} numberOfLines={1}>{expense.title}</Text>
        <Text style={styles.total}>€{expense.amount}</Text>
      </Pressable>
    </Link>
  );
};

export default ExpenseItem;

const styles = StyleSheet.create({
  container: {},
  expenseItem: {
    backgroundColor: 'white',
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 15,
    alignItems: "center",
  },
  expenseCatIcon: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
    borderRadius: 15,
    backgroundColor: "orange",
    padding: 5,
  },
  icon: {
    fontSize: 25,
  },
  total: {
    fontSize: 16,
    fontWeight: "500",
    position: "absolute",
    right: 20,
    alignSelf: "center",
  },
});
