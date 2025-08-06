import React from "react";
import { Stack } from "expo-router";
import { useTranslations } from "@/src/components/Translated";

export default function ExpenseStack() {
  const {t} = useTranslations();

  return (
    <Stack>
      <Stack.Screen
        name="details"
        options={{headerShown: false, title: t("Expense Details")}}
      />
      <Stack.Screen
        name="update"
        options={{headerShown: false, title: t("Update Expense")}}
      />
    </Stack>
  );
}
