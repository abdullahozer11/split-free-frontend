import {StyleSheet, View, Text, Pressable} from 'react-native';
import React, {useEffect, useState} from "react";
import {Feather} from "@expo/vector-icons";
import {Link} from "expo-router";
import {useMemberList} from "@/src/api/members";
import {ActivityIndicator} from "react-native-paper";
import {useAuth} from "@/src/providers/AuthProvider";
import {useProfile} from "@/src/api/profiles";

const ExpenseItem = ({expense}) => {
  const {session} = useAuth();
  const {data: profile, isProfileLoading, isProfileError} = useProfile(session?.user.id)
  const {data: members, isMembersLoading, isMembersError} = useMemberList(expense.group_id);
  const [impact, setImpact] = useState(0);

  useEffect(() => {
    const profileMember = members?.find(member => member.profile === profile?.id);
    setImpact(expense.balances?.find(bl => bl.owner == profileMember?.id)?.amount || 0);
  }, [profile, members]);

  if (isProfileLoading || isMembersLoading) {
    return <ActivityIndicator/>;
  }

  if (isProfileError || isMembersError) {
    return <Text>Failed to fetch data</Text>;
  }

  return (
    <Link href={`/(tabs)/group/${expense.group_id}/expense/${expense.id}/details`} asChild>
      <Pressable style={styles.expenseItem}>
        <View style={styles.expenseCatIcon}>
          <Feather name={'shopping-cart'} source={require('@/assets/images/logo.png')} style={styles.icon}/>
        </View>
        <Text style={{fontSize: 18, fontWeight: '600'}}>{expense.title}</Text>
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
