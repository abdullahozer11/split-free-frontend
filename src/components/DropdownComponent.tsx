import React, {useState} from 'react';
import {StyleSheet, Image, View, Text} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

const MyDropdown = ({selected, label, data, onChange}) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && {borderColor: 'blue'},
        ]}
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
  container: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 0.5,
    borderRadius: 8,
    flex: 1,
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
