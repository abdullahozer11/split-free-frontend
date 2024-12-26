import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const MyDropdown = ({ selected, label, data, onChange }) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);

  return (
    <View className="bg-white border-[0.5px] rounded flex-1">
      <Text
        variant="titleMedium"
        className="absolute left-[10px] bg-white top-[8px] z-999 px-2"
      >
        {label}
      </Text>
      <Dropdown
        style={isFocus && { borderColor: "blue" }}
        className="pl-[30px] pr-[8px] mt-[30px]"
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="name"
        valueField="id"
        searchPlaceholder="Search..."
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
