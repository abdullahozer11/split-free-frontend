import {StyleSheet, View, Text} from 'react-native';
import React from "react";
import {Feather} from "@expo/vector-icons";

const ExpenseItem = ({expense}) => {
  return (
    <View style={styles.expenseItem}>
      <View style={styles.expenseCatIcon}>
        <Feather name={'shopping-cart'} source={require('@/assets/images/logo.png')} style={styles.icon}/>
      </View>
      <View>
        <Text style={{fontSize: 18, fontWeight: '600'}}>{expense.title}</Text>
        <Text style={{fontSize: 14, fontWeight: '300'}}>Total €{expense.amount}</Text>
      </View>
      <Text style={styles.balanceEffect}>+ €46.00</Text>
    </View>
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
  balanceEffect: {
    color: "green",
    fontSize: 16,
    fontWeight: "500",
    position: "absolute",
    right: 20,
    alignSelf: "center",
  },
});
