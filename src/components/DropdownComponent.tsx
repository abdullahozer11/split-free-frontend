import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTranslations } from "@/src/components/Translated";
import { Dropdown } from "react-native-element-dropdown";

export type DropdownItem = {
  id: string | number;
  name: string;
};

type MyDropdownProps<T extends DropdownItem = DropdownItem> = {
  selected?: T["id"] | null;
  label: string;
  data?: readonly T[] | null;
  onChange: (id: T["id"]) => void;
};

const MyDropdown = <T extends DropdownItem>({
  selected,
  label,
  data,
  onChange,
}: MyDropdownProps<T>) => {
  const [isFocus, setIsFocus] = useState(false);
  const { t } = useTranslations();

  return (
    <View className="bg-white border-[0.5px] rounded flex-1 p-2">
      <Text variant="titleMedium" style={styles.label}>
        {label}
      </Text>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={[...(data ?? [])]}
        search
        maxHeight={300}
        labelField="name"
        valueField="id"
        placeholder={t("Select item")}
        searchPlaceholder={t("Search...")}
        value={selected}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          onChange(item.id);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

export default MyDropdown;

const styles = StyleSheet.create({
  label: {
    paddingLeft: 8,
    paddingTop: 4,
  },
  dropdown: {
    paddingHorizontal: 8,
    marginTop: 4,
    minHeight: 40,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
