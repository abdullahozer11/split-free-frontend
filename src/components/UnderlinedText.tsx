import {StyleSheet, View, Text} from 'react-native';
import React from "react";

const underlinedText = ({ text }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.underline} />
    </View>
  );
};

export default underlinedText;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  underline: {
    backgroundColor: '#FCC157FF',
    height: 10,
    width: '100%',
    position: 'absolute',
    top: 14,
    opacity: 0.55,
  },
});
