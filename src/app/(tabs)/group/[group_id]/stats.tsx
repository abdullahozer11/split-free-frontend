import { View, TouchableOpacity, ScrollView } from "react-native";
import { MenuItem, Text, Button } from "@/src/components/Translated";
import { ActivityIndicator, Menu } from "react-native-paper";
import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  exp_cats,
  otherCategory,
  type ExpenseCategory,
} from "@/src/utils/expense_categories";
import {
  ExpenseItem,
  GroupedExpenseItem,
  type ExpenseListItem,
} from "@/src/components/ExpenseItem";
import { useExpenseListAll } from "@/src/api/expenses";
import { useExpenseSubscription } from "@/src/api/expenses/subscriptions";
import { useProfileMember } from "@/src/api/members";
import { useAuth } from "@/src/providers/AuthProvider";
import PieChart from "react-native-pie-chart";
import { inThisMonth } from "@/src/utils/helpers";
import { currencyOptions } from "@/src/constants";
import { useGroup } from "@/src/api/groups";

enum Selection {
  Month = "This Month",
  Global = "Global",
}

type StatsExpense = ExpenseListItem & {
  date?: string | null;
  payers?: { member: number }[] | null;
  participants?: { member: number }[] | null;
};

type CategoryTotal = {
  category: ExpenseCategory;
  total: number;
};

type GroupedByCategory = Record<string, CategoryTotal>;

const memberIsInvolved = (expense: StatsExpense, memberId?: number) =>
  memberId != null &&
  (expense.payers?.some((payer) => payer.member === memberId) ||
    expense.participants?.some(
      (participant) => participant.member === memberId,
    ));

const groupExpensesByCategory = (
  expenses: readonly StatsExpense[],
): GroupedByCategory => {
  const grouped: GroupedByCategory = {};
  for (const expense of expenses) {
    const key = expense.category ?? otherCategory.name;
    if (!grouped[key]) {
      grouped[key] = {
        category:
          exp_cats.find((exp) => exp.name === expense.category) ??
          otherCategory,
        total: 0,
      };
    }
    grouped[key].total += expense.amount ?? 0;
  }
  return Object.fromEntries(
    Object.entries(grouped).sort((a, b) => b[1].total - a[1].total),
  );
};

const largestExpense = (
  expenses: readonly StatsExpense[],
): StatsExpense | null => {
  if (!expenses.length) {
    return null;
  }
  return expenses.reduce(
    (max, expense) =>
      (expense.amount ?? 0) > (max.amount ?? 0) ? expense : max,
    expenses[0],
  );
};

const Stats = () => {
  const { group_id: idString } = useLocalSearchParams();
  const groupId = parseInt(
    typeof idString === "string" ? idString : idString[0],
  );
  const {
    data: group,
    isError: groupError,
    isLoading: groupLoading,
  } = useGroup(groupId);
  const [toggleOnGroup, setToggleOnGroup] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(Selection.Global);

  const navigation = useNavigation();
  const { session } = useAuth();
  const userId = session?.user.id ?? "";

  const {
    data: expenses = [],
    isError,
    isLoading,
  } = useExpenseListAll(groupId);
  const {
    data: profileMember,
    isError: profileMemberError,
    isLoading: profileMemberLoading,
  } = useProfileMember(userId, groupId);

  useExpenseSubscription(groupId);

  const personalExpenses = useMemo(() => {
    if (!expenses.length) return [];
    return expenses.filter((ex) => memberIsInvolved(ex, profileMember?.id));
  }, [expenses, profileMember?.id]);

  const expensesM = useMemo(() => {
    if (!expenses.length) return [];
    return expenses.filter((ex) => inThisMonth(ex?.date));
  }, [expenses]);

  const personalExpensesM = useMemo(() => {
    if (!expensesM.length) return [];
    return expensesM.filter((ex) => memberIsInvolved(ex, profileMember?.id));
  }, [profileMember?.id, expensesM]);

  const { groupedExpensesM, groupedExpensesPerM } = useMemo(() => {
    if (!expensesM.length) {
      return {
        groupedExpensesM: {} as GroupedByCategory,
        groupedExpensesPerM: {} as GroupedByCategory,
      };
    }
    return {
      groupedExpensesM: groupExpensesByCategory(expensesM),
      groupedExpensesPerM: groupExpensesByCategory(personalExpensesM),
    };
  }, [expensesM, personalExpensesM]);

  const { groupedExpenses, groupedExpensesPer } = useMemo(() => {
    if (!expenses.length) {
      return {
        groupedExpenses: {} as GroupedByCategory,
        groupedExpensesPer: {} as GroupedByCategory,
      };
    }
    return {
      groupedExpenses: groupExpensesByCategory(expenses),
      groupedExpensesPer: groupExpensesByCategory(personalExpenses),
    };
  }, [expenses, personalExpenses]);

  const { biggestExpense, biggestExpensePer } = useMemo(() => {
    if (!expenses.length) {
      return { biggestExpense: null, biggestExpensePer: null };
    }
    return {
      biggestExpense: largestExpense(expenses),
      biggestExpensePer: largestExpense(personalExpenses),
    };
  }, [personalExpenses, expenses]);

  const { biggestExpenseM, biggestExpensePerM } = useMemo(() => {
    if (!expensesM.length) {
      return { biggestExpenseM: null, biggestExpensePerM: null };
    }
    return {
      biggestExpenseM: largestExpense(expensesM),
      biggestExpensePerM: largestExpense(personalExpensesM),
    };
  }, [personalExpensesM, expensesM]);

  const { expenseTotal, expenseTotalPer, paidAmount } = useMemo(() => {
    if (!expenses.length) {
      return { expenseTotal: 0, expenseTotalPer: 0, paidAmount: 0 };
    }
    const sum1 = expenses.reduce(
      (sum, expense) => sum + (expense.amount ?? 0),
      0,
    );
    const sum2 = personalExpenses.reduce(
      (sum, expense) => sum + (expense.amount ?? 0),
      0,
    );
    const expenses3 = personalExpenses.filter((ex) =>
      ex.payers?.some((payer) => payer.member === profileMember?.id),
    );
    const sum3 = expenses3.reduce(
      (sum, expense) => sum + (expense.amount ?? 0),
      0,
    );
    return { expenseTotal: sum1, expenseTotalPer: sum2, paidAmount: sum3 };
  }, [personalExpenses, profileMember, expenses]);

  const { expenseTotalM, expenseTotalPerM, paidAmountM } = useMemo(() => {
    if (!expensesM.length) {
      return { expenseTotalM: 0, expenseTotalPerM: 0, paidAmountM: 0 };
    }
    const sum1 = expensesM.reduce(
      (sum, expense) => sum + (expense.amount ?? 0),
      0,
    );
    const sum2 = personalExpensesM.reduce(
      (sum, expense) => sum + (expense.amount ?? 0),
      0,
    );
    const expenses3 = personalExpensesM.filter((ex) =>
      ex.payers?.some((payer) => payer.member === profileMember?.id),
    );
    const sum3 = expenses3.reduce(
      (sum, expense) => sum + (expense.amount ?? 0),
      0,
    );
    return { expenseTotalM: sum1, expenseTotalPerM: sum2, paidAmountM: sum3 };
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

  const paidAmountF = selected === Selection.Global ? paidAmount : paidAmountM;

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

  const groupedEntries = Object.entries(groupedExpensesF);
  const series = groupedEntries.map(([, item]) => item.total);
  const sliceColor = groupedEntries.map(([, item]) => item.category.bg_color);
  const categories = groupedEntries.map(([category]) => category);
  const maxCategoriesPerColumn =
    categories.length > 6 ? categories.length / 2 : 5;
  const firstColumn = categories.slice(0, maxCategoriesPerColumn);
  const secondColumn = categories.slice(
    maxCategoriesPerColumn,
    maxCategoriesPerColumn * 2,
  );
  const lh = categories.length > 10 ? 16 : 20;

  if (isError || profileMemberError || groupError) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  if (isLoading || profileMemberLoading || groupLoading) {
    return <ActivityIndicator />;
  }

  const currencyOption = currencyOptions.find(
    (opt) => opt.value === group?.currency,
  );
  const currency_label = currencyOption?.label || "$";

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
                  <MenuItem
                    onPress={() => {
                      setSelected(Selection.Global);
                      closeMenu();
                    }}
                    title="Global"
                  />
                )}
                {selected === Selection.Global && (
                  <MenuItem
                    onPress={() => {
                      setSelected(Selection.Month);
                      closeMenu();
                    }}
                    title="This month"
                  />
                )}
              </Menu>
            </View>
          </View>
          <View className="flex-row justify-between items-center rounded-[15px] overflow-hidden">
            <Button
              textColor={toggleOnGroup ? "white" : "gray"}
              onPress={() => setToggleOnGroup(true)}
              className="flex-1 rounded-[0px]"
              style={{ backgroundColor: toggleOnGroup ? "black" : "lightgray" }}
            >
              Group
            </Button>
            <Button
              textColor={toggleOnGroup ? "gray" : "white"}
              onPress={() => setToggleOnGroup(false)}
              className="flex-1 rounded-[0px]"
              style={{ backgroundColor: toggleOnGroup ? "lightgray" : "black" }}
            >
              Personal
            </Button>
          </View>
          <View className="flex-row justify-between items-center">
            <View>
              <Text variant={"headlineMedium"}>Spent</Text>
              <Text variant={"headlineSmall"}>
                {currency_label}
                {expenseTotalF.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text variant={"headlineMedium"}>You paid for</Text>
              <Text variant={"headlineSmall"} className="text-green-600">
                + {currency_label}
                {paidAmountF.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <Text variant={"headlineMedium"}>Spending breakdown</Text>
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
              {categories.map((category) => (
                <GroupedExpenseItem
                  key={category}
                  total={groupedExpensesF[category].total}
                  exp_cat={groupedExpensesF[category].category}
                  currency_label={currency_label}
                />
              ))}
            </View>
          </View>
          {biggestExpenseF && (
            <View style={{ gap: 10 }}>
              <Text variant={"headlineMedium"}>Largest Spending</Text>
              <ExpenseItem
                key={biggestExpenseF.id}
                expense={biggestExpenseF}
                currency_label={currency_label}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;
