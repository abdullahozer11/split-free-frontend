import {View, Text, TextInput, StyleSheet} from "react-native";
import React from "react";
import {GlobalStyles} from "@/src/styles/globals.styles";


const Input = ({label, textInputConfig, style}) => {
  const inputStyles = [styles.input];
  if (textInputConfig && textInputConfig.multiline) {
    inputStyles.push(styles.inputMultiline)
  }
  return (
    <View style={[
      styles.inputContainer,
      style
    ]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={inputStyles} {...textInputConfig} />
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: GlobalStyles.colors.primary800,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    color: GlobalStyles.colors.primary700,
    padding: 6,
    borderRadius: 6,
    fontSize: 18
  },
  inputMultiline: {
    minHeight: 100,
  },
})
