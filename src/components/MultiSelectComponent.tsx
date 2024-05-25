import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';

const MyMultiSelect = ({ selected, members, onChange }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleDone = () => {
    setIsDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
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
        placeholder={'Select participants'}
        searchPlaceholder="Search..."
        value={selected}
        onChange={(item) => {
          onChange(item);
        }}
        renderRightIcon={() =>
          {return (isDropdownVisible && <TouchableOpacity onPress={handleDone}>
          <Text style={styles.doneButton}>Close</Text>
          </TouchableOpacity>)}
        }
        selectedStyle={styles.selectedStyle}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setIsDropdownVisible(false)}
        visible={isDropdownVisible}
      />
    </View>
  );
};

export default MyMultiSelect;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dropdown: {
    paddingLeft: 30,
    paddingRight: 8,
    marginTop: 30,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 10,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
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
  selectedStyle: {},
  doneButton: {
    fontSize: 16,
    paddingRight: 10,
  },
});
