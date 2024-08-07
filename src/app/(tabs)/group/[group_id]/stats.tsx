import { View, TouchableOpacity, ScrollView } from "react-native";
import { ActivityIndicator, Button, Menu, Text } from "react-native-paper";
import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { exp_cats } from "@/src/utils/expense_categories";
import {
  ExpenseItem,
  GroupedExpenseItem,
} from "@/src/components/ExpenseItem.tsx";
import { useExpenseList } from "@/src/api/expenses/index.ts";
import { useProfileMember } from "@/src/api/members/index.ts";
import { useAuth } from "@/src/providers/AuthProvider.tsx";
import PieChart from "react-native-pie-chart/src/index.tsx";
import { inThisMonth } from "@/src/utils/helpers.ts";

enum Selection {
  Month = "This Month",
  Global = "Global",
}

const Stats = () => {
  const { group_id: idString } = useLocalSearchParams();
  const groupId = parseInt(
    typeof idString === "string" ? idString : idString[0],
  );
  const [toggleOnGroup, setToggleOnGroup] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(Selection.Global);

  const navigation = useNavigation();
  const { session } = useAuth();

  const { data: expenses, isError, isLoading } = useExpenseList(groupId);
  const {
    data: profileMember,
    isError: profileMemberError,
    isLoading: profileMemberLoading,
  } = useProfileMember(session?.user.id, groupId);

  const personalExpenses = useMemo(() => {
    if (!expenses.length) return [];
    return expenses.filter(
      (ex) =>
        ex?.payers?.some((payer) => payer.member === profileMember?.id) ||
        ex?.participants?.some((payer) => payer.member === profileMember?.id),
    );
  }, [expenses, profileMember?.id]);

  const expensesM = useMemo(() => {
    if (!expenses.length) return [];
    return expenses.filter((ex) => inThisMonth(ex?.date));
  }, [expenses]);

  const personalExpensesM = useMemo(() => {
    if (!expensesM.length) return [];
    return expensesM.filter(
      (ex) =>
        ex?.payers?.some((payer) => payer.member === profileMember?.id) ||
        ex?.participants?.some((payer) => payer.member === profileMember?.id),
    );
  }, [profileMember?.id, expensesM]);

  const { groupedExpensesM, groupedExpensesPerM } = useMemo(() => {
    if (!expensesM.length)
      return { groupedExpensesM: [], groupedExpensesPerM: [] };

    const grouped = expensesM.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat =
          exp_cats.find((exp) => exp.name === expense?.category) ||
          exp_cats.find((exp) => exp.name === "Other");
        acc[expense?.category] = { category: exp_cat, total: 0 };
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    const groupedArray = Object.entries(grouped);
    const sortedGroupedArray = groupedArray.sort(
      (a, b) => b[1].total - a[1].total,
    );
    const sortedGrouped = Object.fromEntries(sortedGroupedArray);

    const grouped2 = personalExpensesM.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat =
          exp_cats.find((exp) => exp.name === expense?.category) ||
          exp_cats.find((exp) => exp.name === "Other");
        acc[expense?.category] = { category: exp_cat, total: 0 };
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    const groupedArray2 = Object.entries(grouped2);
    const sortedGroupedArray2 = groupedArray2.sort(
      (a, b) => b[1].total - a[1].total,
    );
    const sortedGrouped2 = Object.fromEntries(sortedGroupedArray2);

    return {
      groupedExpensesM: sortedGrouped,
      groupedExpensesPerM: sortedGrouped2,
    };
  }, [expensesM, personalExpensesM]);

  const { groupedExpenses, groupedExpensesPer } = useMemo(() => {
    if (!expenses.length)
      return { groupedExpenses: [], groupedExpensesPer: [] };

    const grouped = expenses.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat =
          exp_cats.find((exp) => exp.name === expense?.category) ||
          exp_cats.find((exp) => exp.name === "Other");
        acc[expense?.category] = { category: exp_cat, total: 0 };
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    const groupedArray = Object.entries(grouped);
    const sortedGroupedArray = groupedArray.sort(
      (a, b) => b[1].total - a[1].total,
    );
    const sortedGrouped = Object.fromEntries(sortedGroupedArray);

    const grouped2 = personalExpenses.reduce((acc, expense) => {
      if (!acc[expense?.category]) {
        const exp_cat =
          exp_cats.find((exp) => exp.name === expense?.category) ||
          exp_cats.find((exp) => exp.name === "Other");
        acc[expense?.category] = { category: exp_cat, total: 0 };
      }
      acc[expense?.category].total += expense.amount;
      return acc;
    }, {});

    const groupedArray2 = Object.entries(grouped2);
    const sortedGroupedArray2 = groupedArray2.sort(
      (a, b) => b[1].total - a[1].total,
    );
    const sortedGrouped2 = Object.fromEntries(sortedGroupedArray2);

    return {
      groupedExpenses: sortedGrouped,
      groupedExpensesPer: sortedGrouped2,
    };
  }, [expenses, personalExpenses]);

  const { biggestExpense, biggestExpensePer } = useMemo(() => {
    if (!expenses.length)
      return { biggestExpense: null, biggestExpensePer: null };
    const max1 = expenses.reduce(
      (max, expense) => (expense.amount > max.amount ? expense : max),
      expenses[0],
    );
    const max2 = personalExpenses.reduce(
      (max, expense) => (expense.amount > max.amount ? expense : max),
      personalExpenses[0],
    );
    return { biggestExpense: max1, biggestExpensePer: max2 };
  }, [personalExpenses, expenses]);

  const { biggestExpenseM, biggestExpensePerM } = useMemo(() => {
    if (!expensesM) return { biggestExpenseM: null, biggestExpensePerM: null };
    const max1 = expensesM.reduce(
      (max, expense) => (expense.amount > max.amount ? expense : max),
      expensesM[0],
    );
    const max2 = personalExpensesM.reduce(
      (max, expense) => (expense.amount > max.amount ? expense : max),
      personalExpensesM[0],
    );
    return { biggestExpenseM: max1, biggestExpensePerM: max2 };
  }, [personalExpensesM, expensesM]);

  const { expenseTotal, expenseTotalPer, payedAmount } = useMemo(() => {
    if (!expenses.length)
      return { expenseTotal: 0, expenseTotalPer: 0, payedAmount: 0 };
    const sum1 = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const sum2 = personalExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const expenses3 = personalExpenses.filter((ex) =>
      ex?.payers?.some((payer) => payer.member === profileMember?.id),
    );
    const sum3 = expenses3.reduce((sum, expense) => sum + expense.amount, 0);
    return { expenseTotal: sum1, expenseTotalPer: sum2, payedAmount: sum3 };
  }, [personalExpenses, profileMember, expenses]);

  const { expenseTotalM, expenseTotalPerM, payedAmountM } = useMemo(() => {
    if (!expensesM.length)
      return { expenseTotalM: 0, expenseTotalPerM: 0, payedAmountM: 0 };
    const sum1 = expensesM.reduce((sum, expense) => sum + expense.amount, 0);
    const sum2 = personalExpensesM.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const expenses3 = personalExpensesM.filter((ex) =>
      ex?.payers?.some((payer) => payer.member === profileMember?.id),
    );
    const sum3 = expenses3.reduce((sum, expense) => sum + expense.amount, 0);
    return { expenseTotalM: sum1, expenseTotalPerM: sum2, payedAmountM: sum3 };
  }, [personalExpensesM, expensesM, profileMember?.id]);

  const openMenu = () => {
    setVisible(true);
  };
  const closeMenu = () => {
    setVisible(false);
  };

  const expenseTotalF = toggleOnGroup
    ? selected === Selection.Global
      ? expenseTotal
      : expenseTotalM
    : selected === Selection.Global
      ? expenseTotalPer
      : expenseTotalPerM;

  const payedAmountF =
    selected === Selection.Global ? payedAmount : payedAmountM;

  const groupedExpensesF = toggleOnGroup
    ? selected === Selection.Global
      ? groupedExpenses
      : groupedExpensesM
    : selected === Selection.Global
      ? groupedExpensesPer
      : groupedExpensesPerM;

  const biggestExpenseF = toggleOnGroup
    ? selected === Selection.Global
      ? biggestExpense
      : biggestExpenseM
    : selected === Selection.Global
      ? biggestExpensePer
      : biggestExpensePerM;

  const series = Object.keys(groupedExpensesF).map(
    (category) => groupedExpensesF[category].total,
  );
  const sliceColor = Object.keys(groupedExpensesF).map(
    (category) => groupedExpensesF[category].category.bg_color,
  );

  const categories = Object.keys(groupedExpensesF);
  const maxCategoriesPerColumn =
    categories.length > 6 ? categories.length / 2 : 5;
  const firstColumn = categories.slice(0, maxCategoriesPerColumn);
  const secondColumn = categories.slice(
    maxCategoriesPerColumn,
    maxCategoriesPerColumn * 2,
  );
  const lh = categories.length > 10 ? 16 : 20;

  if (isLoading || profileMemberLoading) {
    return <ActivityIndicator />;
  }

  if (isError || profileMemberError) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="m-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Feather name={"arrow-left"} color={"black"} size={44} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View className="flex-1 p-5" style={{ gap: 20 }}>
          <View className="flex-row justify-between items-center">
            <Text variant={"headlineMedium"}>Statistics</Text>
            <View className="flex-row justify-between items-center">
              <Menu
                contentStyle={{
                  backgroundColor: "white",
                  position: "relative",
                  top: 80,
                }}
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                  <TouchableOpacity
                    onPress={openMenu}
                    className="flex-row justify-between items-center"
                  >
                    <Text variant={"headlineMedium"}>{selected}</Text>
                    <Feather name={"chevron-down"} size={24} />
                  </TouchableOpacity>
                }
              >
                {selected === Selection.Month && (
                  <Menu.Item
                    onPress={() => {
                      setSelected(Selection.Global);
                      closeMenu();
                    }}
                    title="Global"
                  />
                )}
                {selected === Selection.Global && (
                  <Menu.Item
                    onPress={() => {
                      setSelected(Selection.Month);
                      closeMenu();
                    }}
                    title="This Month"
                  />
                )}
              </Menu>
            </View>
          </View>
          <View className="flex-row justify-between items-center rounded-[15px] overflow-hidden">
            <Button
              textColor={toggleOnGroup ? "gray" : "white"}
              onPress={() => setToggleOnGroup(false)}
              className="flex-1 rounded-[0px]"
              style={{ backgroundColor: toggleOnGroup ? "lightgray" : "black" }}
            >
              Group
            </Button>
            <Button
              textColor={toggleOnGroup ? "white" : "gray"}
              onPress={() => setToggleOnGroup(true)}
              className="flex-1 rounded-[0px]"
              style={{ backgroundColor: toggleOnGroup ? "black" : "lightgray" }}
            >
              Personal
            </Button>
          </View>
          <View className="flex-row justify-between items-center">
            <View>
              <Text variant={"headlineMedium"}>Spent</Text>
              <Text variant={"headlineSmall"}>€{expenseTotalF.toFixed(2)}</Text>
            </View>
            <View>
              <Text variant={"headlineMedium"}>You paid for</Text>
              <Text variant={"headlineSmall"} className="text-green-600">
                + €{payedAmountF.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <Text variant={"headlineMedium"}>Spending Breakdown</Text>
            <View className="flex-row justify-between items-center">
              {!!series.length && (
                <PieChart
                  widthAndHeight={120}
                  series={series}
                  sliceColor={sliceColor}
                />
              )}
              <View style={{ gap: 2 }}>
                {!!firstColumn.length &&
                  firstColumn.map((category) => (
                    <View
                      key={category}
                      style={{ flexDirection: "row", gap: 2 }}
                    >
                      <View
                        style={{
                          height: lh,
                          width: lh,
                          borderRadius: lh / 2,
                          backgroundColor:
                            groupedExpensesF[category].category.bg_color,
                        }}
                      />
                      <Text style={{ fontSize: (lh * 2) / 3 }}>{category}</Text>
                    </View>
                  ))}
              </View>
              <View style={{ gap: 2 }}>
                {!!secondColumn.length &&
                  secondColumn.map((category) => (
                    <View
                      key={category}
                      style={{ gap: 2 }}
                      className="flex-row"
                    >
                      <View
                        style={{
                          height: lh,
                          width: lh,
                          borderRadius: lh / 2,
                          backgroundColor:
                            groupedExpensesF[category].category.bg_color,
                        }}
                      />
                      <Text style={{ fontSize: (lh * 2) / 3 }}>{category}</Text>
                    </View>
                  ))}
              </View>
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <Text variant={"headlineMedium"}>Spending per category</Text>
            <View style={{ gap: 10 }}>
              {Object.keys(groupedExpensesF).map((category) => (
                <GroupedExpenseItem
                  key={category}
                  total={groupedExpensesF[category].total}
                  exp_cat={groupedExpensesF[category].category}
                />
              ))}
            </View>
          </View>
          {biggestExpenseF && (
            <View style={{ gap: 10 }}>
              <Text variant={"headlineMedium"}>Largest Spending</Text>
              <ExpenseItem
                key={biggestExpenseF?.id}
                expense={biggestExpenseF}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;
