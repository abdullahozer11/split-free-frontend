import { View, Pressable } from "react-native";
import { Text } from "react-native-paper";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { exp_cats } from "@/src/utils/expense_categories";

export const ExpenseItem = ({ expense }) => {
  const exp_cat =
    exp_cats.find((exp) => exp.name === expense.category) ||
    exp_cats.find((exp) => exp.name === "Other");
  return (
    <Link
      href={`/(tabs)/group/${expense.group_id}/expense/${expense.id}/details`}
      asChild
    >
      <Pressable
        style={
          expense?.settled && { borderWidth: 1, borderColor: "lightgreen" }
        }
        className="bg-white py-3 px-1 pr-4 rounded-lg gap-x-4 items-center mx-1 flex flex-row justify-between mb-2"
      >
        <View
          style={{ backgroundColor: exp_cat.bg_color }}
          className="justify-center items-center h-12 w-12 rounded-lg p-2"
        >
          <MaterialIcons
            name={exp_cat.icon}
            color={exp_cat.icon_color}
            size={25}
          />
        </View>
        <Text variant="titleMedium" numberOfLines={1} className="flex-1 mx-4">
          {expense.title}
        </Text>
        <View>
          <Text variant="titleSmall" className="text-right">
            €{expense.amount}
          </Text>
          {expense?.settled && (
            <Text variant={"titleSmall"} className={"text-green-500"}>
              settled
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
};

export const GroupedExpenseItem = ({ total, exp_cat }) => {
  return (
    <View className="bg-white py-3 px-1 pr-4 rounded-lg gap-x-4 items-center mx-1 flex flex-row justify-between">
      <View
        style={{ backgroundColor: exp_cat.bg_color }}
        className="justify-center items-center h-12 w-12 rounded-lg p-2"
      >
        <MaterialIcons
          name={exp_cat.icon}
          color={exp_cat.icon_color}
          size={25}
        />
      </View>
      <Text variant="titleMedium" className="flex-1 mx-4" numberOfLines={1}>
        {exp_cat.name}
      </Text>
      <Text variant="titleSmall">€{total && total?.toFixed(2)}</Text>
    </View>
  );
};
