import {StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import {ActivityIndicator, Button, Menu, Text} from 'react-native-paper';
import React, {useMemo, useState} from "react";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {Feather} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {exp_cats} from "@/src/utils/expense_categories";
import {ExpenseItem, GroupedExpenseItem} from "@/src/components/ExpenseItem.tsx";
import {useExpenseList} from "@/src/api/expenses/index.ts";
import {useProfileMember} from "@/src/api/members/index.ts";
import {useAuth} from "@/src/providers/AuthProvider.tsx";
import PieChart from "react-native-pie-chart/src/index.tsx";
import {inThisMonth} from "@/src/utils/helpers.ts";

enum Selection {
  Month = 'This Month',
  Global = 'Global',
}

const Stats = () => {
  const {group_id: idString} = useLocalSearchParams();
  const groupId = parseInt(typeof idString === 'string' ? idString : idString[0]);
  const [toggleOnGroup, setToggleOnGroup] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(Selection.Global);

  const navigation = useNavigation();
  const {session} = useAuth();

  const {data: expenses, isError, isLoading} = useExpenseList(groupId);
  const {data: profileMember, isError: profileMemberError, isLoading: profileMemberLoading} = useProfileMember(session?.user.id, groupId);

  const personalExpenses = useMemo(() => {
    if (!expenses.length) return [];
    return expenses.filter((ex) => ex?.payers?.some(payer => payer.member === profileMember?.id) ||
      ex?.participants?.some(payer => payer.member === profileMember?.id));
  }, [expenses, profileMember]);

  const expensesM = useMemo(() => {
    if (!expenses.length) return [];
    return expenses.filter((ex) => inThisMonth(ex?.date));
  }, [expenses]);

  const personalExpensesM = useMemo(() => {
    if (!expensesM.length) return [];
    return expensesM.filter((ex) => ex?.payers?.some(payer => payer.member === profileMember?.id) ||
      ex?.participants?.some(payer => payer.member === profileMember?.id));
  }, [expensesM]);

  const {groupedExpensesM, groupedExpensesPerM} = useMemo(() => {
    if (!expensesM.length) return {groupedExpensesM: [], groupedExpensesPerM: []};

    const grouped = expensesM.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat = exp_cats.find((exp) => exp.name == expense?.category) || exp_cats.find((exp) => exp.name == 'Other');
        acc[expense?.category] = {category: exp_cat, total: 0};
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    const grouped2 = personalExpensesM.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat = exp_cats.find((exp) => exp.name == expense?.category) || exp_cats.find((exp) => exp.name == 'Other');
        acc[expense?.category] = {category: exp_cat, total: 0};
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    return {groupedExpensesM: grouped, groupedExpensesPerM: grouped2};
  }, [expensesM, personalExpensesM]);

  const {groupedExpenses, groupedExpensesPer} = useMemo(() => {
    if (!expenses.length) return {groupedExpenses: [], groupedExpensesPer: []};

    const grouped = expenses.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat = exp_cats.find((exp) => exp.name == expense?.category) || exp_cats.find((exp) => exp.name == 'Other');
        acc[expense?.category] = {category: exp_cat, total: 0};
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    const grouped2 = personalExpenses.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat = exp_cats.find((exp) => exp.name == expense?.category) || exp_cats.find((exp) => exp.name == 'Other');
        acc[expense?.category] = {category: exp_cat, total: 0};
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    return {groupedExpenses: grouped, groupedExpensesPer: grouped2};
  }, [expenses, personalExpenses]);

  const {biggestExpense, biggestExpensePer} = useMemo(() => {
    if (!expenses.length) return {biggestExpense: null, biggestExpensePer: null};
    const max1 = expenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max), expenses[0])
    const max2 = personalExpenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max), personalExpenses[0])
    return {biggestExpense: max1, biggestExpensePer: max2};
  }, [expenses]);

  const {biggestExpenseM, biggestExpensePerM} = useMemo(() => {
    if (!expensesM) return {biggestExpenseM: null, biggestExpensePerM: null};
    const max1 = expensesM.reduce((max, expense) => (expense.amount > max.amount ? expense : max), expensesM[0])
    const max2 = personalExpensesM.reduce((max, expense) => (expense.amount > max.amount ? expense : max), personalExpensesM[0])
    return {biggestExpenseM: max1, biggestExpensePerM: max2};
  }, [expensesM]);

  const {expenseTotal, expenseTotalPer, payedAmount} = useMemo(() => {
    if (!expenses.length) return {expenseTotal: 0, expenseTotalPer: 0, payedAmount: 0};
    const sum1 = expenses.reduce((sum, expense) => (sum + expense.amount), 0)
    const sum2 = personalExpenses.reduce((sum, expense) => (sum + expense.amount), 0);
    const expenses3 = personalExpenses.filter((ex) => ex?.payers?.some(payer => payer.member === profileMember?.id));
    const sum3 = expenses3.reduce((sum, expense) => (sum + expense.amount), 0);
    return {expenseTotal: sum1, expenseTotalPer: sum2, payedAmount: sum3};
  }, [expenses]);

  const {expenseTotalM, expenseTotalPerM, payedAmountM} = useMemo(() => {
    if (!expensesM.length) return {expenseTotalM: 0, expenseTotalPerM: 0, payedAmountM: 0};
    const sum1 = expensesM.reduce((sum, expense) => (sum + expense.amount), 0)
    const sum2 = personalExpensesM.reduce((sum, expense) => (sum + expense.amount), 0);
    const expenses3 = personalExpensesM.filter((ex) => ex?.payers?.some(payer => payer.member === profileMember?.id));
    const sum3 = expenses3.reduce((sum, expense) => (sum + expense.amount), 0);
    return {expenseTotalM: sum1, expenseTotalPerM: sum2, payedAmountM: sum3};
  }, [expensesM]);

  const openMenu = () => {setVisible(true)};
  const closeMenu = () => {setVisible(false)};

  const expenseTotalF = toggleOnGroup
    ? (selected == Selection.Global ? expenseTotal : expenseTotalM)
    : (selected == Selection.Global ? expenseTotalPer : expenseTotalPerM);

  const payedAmountF = selected == Selection.Global ? payedAmount : payedAmountM;

  const groupedExpensesF = toggleOnGroup
  ? (selected == Selection.Global ? groupedExpenses : groupedExpensesM)
  : (selected == Selection.Global ? groupedExpensesPer : groupedExpensesPerM);

  const biggestExpenseF = toggleOnGroup
    ? (selected == Selection.Global ? biggestExpense : biggestExpenseM)
    : (selected == Selection.Global ? biggestExpensePer : biggestExpensePerM);

  const series = Object.keys(groupedExpensesF).map((category) => (groupedExpensesF[category].total));
  const sliceColor = Object.keys(groupedExpensesF).map((category) => (groupedExpensesF[category].category.bg_color));

  const categories = Object.keys(groupedExpensesF);
  const maxCategoriesPerColumn = categories.length > 6 ? (categories.length / 2) : 5;
  const firstColumn = categories.slice(0, maxCategoriesPerColumn);
  const secondColumn = categories.slice(maxCategoriesPerColumn, maxCategoriesPerColumn * 2);
  const lh = categories.length > 10 ? 16 : 20;

  if (isLoading || profileMemberLoading) {
    return <ActivityIndicator/>;
  }

  if (isError || profileMemberError) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather name={"arrow-left"} color={'black'} size={44}/>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.row}>
            <Text variant={"headlineMedium"}>Statistics</Text>
            <View style={styles.row}>
              <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={<TouchableOpacity onPress={openMenu} style={styles.row}>
                  <Text variant={"headlineMedium"}>{selected}</Text>
                  <Feather name={"chevron-down"} size={24}/>
                </TouchableOpacity>}
              >
                {selected == Selection.Month && <Menu.Item onPress={() => {
                  setSelected(Selection.Global);
                  closeMenu();
                }} title="Global"/>}
                {selected == Selection.Global && <Menu.Item onPress={() => {
                  setSelected(Selection.Month);
                  closeMenu();
                }} title="This Month"/>}
              </Menu>
            </View>
          </View>
          <View style={[styles.row, {borderRadius: 30, overflow: 'hidden'}]}>
            <Button textColor={toggleOnGroup ? 'gray' : 'white'} onPress={() => setToggleOnGroup(false)}
                    style={[styles.switchButton, {backgroundColor: toggleOnGroup ? 'lightgray' : 'black'}]}>Group</Button>
            <Button textColor={toggleOnGroup ? 'white' : 'gray'} onPress={() => setToggleOnGroup(true)}
                    style={[styles.switchButton, {backgroundColor: toggleOnGroup ? 'black' : 'lightgray'}]}>Personal</Button>
          </View>
          <View style={styles.row}>
            <View>
              <Text variant={"headlineMedium"}>Spent</Text>
              <Text variant={"headlineSmall"}>€{expenseTotalF}</Text>
            </View>
            <View>
              <Text variant={"headlineMedium"}>You paid for</Text>
              <Text variant={"headlineSmall"} style={{color: 'green'}}>+ €{payedAmountF}</Text>
            </View>
          </View>
          <View style={styles.gap}>
            <Text variant={"headlineMedium"}>Spending Breakdown</Text>
            <View style={[styles.row, {gap: 3}]}>
              {!!series.length && <PieChart
                widthAndHeight={120}
                series={series}
                sliceColor={sliceColor}
              />}
              <View style={{gap: 2}}>
                {!!firstColumn.length && firstColumn.map((category) => (
                  <View key={category} style={[{flexDirection: "row"}, styles.gap]}>
                    <View style={{height: lh, width: lh, borderRadius: lh / 2, backgroundColor: groupedExpensesF[category].category.bg_color}}/>
                    <Text style={{fontSize: lh * 2 / 3}}>{category}</Text>
                  </View>
                ))}
              </View>
              <View>
                {!!secondColumn.length && secondColumn.map((category) => (
                  <View key={category} style={[styles.row, styles.gap]}>
                    <View style={{height: lh, width: lh, borderRadius: lh / 2, backgroundColor: groupedExpensesF[category].category.bg_color}}/>
                    <Text style={{fontSize: lh * 2 / 3}}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.gap}>
            <Text variant={"headlineMedium"}>Spending per category</Text>
            <View style={styles.gap}>
              {Object.keys(groupedExpensesF).map((category) => (
                <GroupedExpenseItem
                  key={category}
                  total={groupedExpensesF[category].total}
                  exp_cat={groupedExpensesF[category].category}
                />
              ))}
            </View>
          </View>
          {biggestExpenseF && <View style={styles.gap}>
            <Text variant={"headlineMedium"}>Largest Spending</Text>
            <ExpenseItem key={biggestExpenseF?.id} expense={biggestExpenseF}/>
          </View>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6FF",
  },
  header: {
    marginTop: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  switchButton: {
    borderRadius: 0,
    flex: 1,
  },
  gap: {
    gap: 10
  },
});
