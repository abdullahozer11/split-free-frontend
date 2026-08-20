import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/Translated";
import { MultiSelect } from "react-native-element-dropdown";
import { Feather } from "@expo/vector-icons";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider.js";

const MyMultiSelect = ({ selected, members, onChange }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  const handleDone = () => {
    setIsDropdownVisible(false);
  };

  const renderItem = (item) => {
    return (
      <View className={"flex-row h-16 px-3 py-2 justify-between items-center"}>
        <Text variant={"bodyLarge"}>{item.name}</Text>
        {selected.includes(item.id) && (
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
        data={members}
        labelField="name"
        valueField="id"
        placeholder={int["Select participants"]}
        searchPlaceholder={int["Search..."]}
        value={selected}
        onChange={(item) => {
          onChange(item);
        }}
        renderItem={renderItem}
        renderRightIcon={() => {
          return (
            isDropdownVisible && (
              <TouchableOpacity onPress={handleDone}>
                <Text variant={"labelLarge"} className={"mr-3"}>
                  Close
                </Text>
              </TouchableOpacity>
            )
          );
        }}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setIsDropdownVisible(false)}
        visible={isDropdownVisible}
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
