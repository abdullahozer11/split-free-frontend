import {StyleSheet, View, Text, Pressable} from 'react-native';
import React, {useEffect, useState} from "react";
import {Feather} from "@expo/vector-icons";
import {Link} from "expo-router";
import {useMemberList} from "@/src/api/members";
import {ActivityIndicator} from "react-native-paper";

const ExpenseItem = ({expense}) => {
  const [impact, setImpact] = useState(0);
  const {data: members, isLoading, isError} = useMemberList(expense.group_id);
  const memberId = members?.find(mb => mb.group_id == expense.group_id).id | null;

  useEffect(() => {
    setImpact(expense.balances?.find(bl => bl.owner == memberId)?.amount | 0);
  }, [memberId]);

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (isError) {
    return <Text>Failed to fetch data</Text>;
  }

  return (
    <Link href={`/(tabs)/group/${expense.group_id}/expense/${expense.id}/details`} asChild>
      <Pressable style={styles.expenseItem}>
        <View style={styles.expenseCatIcon}>
          <Feather name={'shopping-cart'} source={require('@/assets/images/logo.png')} style={styles.icon}/>
        </View>
        <View>
          <Text style={{fontSize: 18, fontWeight: '600'}}>{expense.title}</Text>
          <Text style={{fontSize: 14, fontWeight: '300'}}>Total €{expense.amount}</Text>
        </View>
        <Text style={styles.balanceEffect}>
          {impact > 0 ? '+' + impact : impact} €
        </Text>
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
