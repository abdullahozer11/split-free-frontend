import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, useTranslations } from "@/src/components/Translated";
import { MultiSelect } from "react-native-element-dropdown";
import { Feather } from "@expo/vector-icons";
import type { DropdownItem } from "@/src/components/DropdownComponent";

type MyMultiSelectProps<T extends DropdownItem = DropdownItem> = {
  selected?: readonly T["id"][] | null;
  members?: readonly T[] | null;
  onChange: (ids: T["id"][]) => void;
};

const MyMultiSelect = <T extends DropdownItem>({
  selected,
  members,
  onChange,
}: MyMultiSelectProps<T>) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { t } = useTranslations();
  const selectedIds = selected ?? [];

  const handleDone = () => {
    setIsDropdownVisible(false);
  };

  const renderItem = (item: T) => {
    return (
      <View className={"flex-row h-16 px-3 py-2 justify-between items-center"}>
        <Text variant={"bodyLarge"}>{item.name}</Text>
        {selectedIds.includes(item.id) && (
          <Feather color="green" name="check" size={24} />
        )}
      </View>
    );
  };

  return (
    <View className={"rounded-md border-[0.5px] bg-white p-2"}>
      <Text variant={"titleMedium"} style={styles.label}>
        Who shares this expense?
      </Text>
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        search
        data={[...(members ?? [])]}
        labelField="name"
        valueField="id"
        placeholder={t("Select participants")}
        searchPlaceholder={t("Search...")}
        value={[...selectedIds] as string[]}
        onChange={(item) => {
          onChange(item as T["id"][]);
        }}
        renderItem={renderItem}
        renderRightIcon={() => {
          if (!isDropdownVisible) {
            return null;
          }
          return (
            <TouchableOpacity onPress={handleDone}>
              <Text variant={"labelLarge"} className={"mr-3"}>
                Close
              </Text>
            </TouchableOpacity>
          );
        }}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setIsDropdownVisible(false)}
      />
    </View>
  );
};

export default MyMultiSelect;

const styles = StyleSheet.create({
  label: {
    paddingLeft: 8,
    paddingTop: 8,
  },
  dropdown: {
    paddingLeft: 28,
    paddingRight: 8,
    marginTop: 8,
    minHeight: 40,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontWeight: "600",
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
