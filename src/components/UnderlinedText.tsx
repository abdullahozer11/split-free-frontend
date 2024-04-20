import {StyleSheet, View, Text} from 'react-native';
import React from "react";

const UnderlinedText = ({ text, fontSize, fontWeight }) => {
  return (
    <View style={styles.container}>
      <Text style={{fontSize: fontSize, fontWeight: fontWeight}}>{text}</Text>
      <View style={[styles.underline, {top: fontSize - 4}]} />
    </View>
  );
};

export default UnderlinedText;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  underline: {
    backgroundColor: 'orange',
    height: 10,
    width: '100%',
    position: 'absolute',
    opacity: 0.55,
  },
});
