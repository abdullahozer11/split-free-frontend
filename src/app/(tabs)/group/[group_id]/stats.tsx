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
import { ExpenseItem, GroupedExpenseItem } from "@/src/components/ExpenseItem";
import {
  useGroupExpenseStats,
  type ExpenseStatsCategoryTotal,
  type ExpenseStatsSlice,
} from "@/src/api/expenses";
import { useExpenseSubscription } from "@/src/api/expenses/subscriptions";
import PieChart from "react-native-pie-chart";
import { currencyOptions } from "@/src/constants";
import { useGroup } from "@/src/api/groups";

enum Selection {
  Month = "This Month",
  Global = "Global",
}

type CategoryTotal = {
  category: ExpenseCategory;
  total: number;
};

type GroupedByCategory = Record<string, CategoryTotal>;

const emptySlice: ExpenseStatsSlice = {
  total: 0,
  categories: [],
  largest: null,
};

const groupedFromTotals = (
  categories: readonly ExpenseStatsCategoryTotal[],
): GroupedByCategory => {
  const grouped: GroupedByCategory = {};
  for (const row of categories) {
    grouped[row.category] = {
      category:
        exp_cats.find((exp) => exp.name === row.category) ?? otherCategory,
      total: row.total,
    };
  }
  return grouped;
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
  const { data: stats, isError, isLoading } = useGroupExpenseStats(groupId);

  useExpenseSubscription(groupId);

  const slice = useMemo((): ExpenseStatsSlice => {
    if (!stats) {
      return emptySlice;
    }
    if (toggleOnGroup) {
      return selected === Selection.Global
        ? stats.group_all
        : stats.group_month;
    }
    return selected === Selection.Global
      ? stats.personal_all
      : stats.personal_month;
  }, [stats, toggleOnGroup, selected]);

  const paidAmountF =
    selected === Selection.Global
      ? (stats?.paid_all ?? 0)
      : (stats?.paid_month ?? 0);

  const groupedExpensesF = useMemo(
    () => groupedFromTotals(slice.categories),
    [slice.categories],
  );
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

  const openMenu = () => {
    setVisible(true);
  };
  const closeMenu = () => {
    setVisible(false);
  };

  if (isError || groupError) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  if (isLoading || groupLoading) {
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
                {slice.total.toFixed(2)}
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
          {slice.largest && (
            <View style={{ gap: 10 }}>
              <Text variant={"headlineMedium"}>Largest Spending</Text>
              <ExpenseItem
                key={slice.largest.id}
                expense={slice.largest}
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
