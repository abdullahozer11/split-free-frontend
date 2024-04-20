import {StyleSheet, View, Text} from 'react-native';
import React from "react";

const LineGraph = ({leftPercentage}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.leftColor, { flex: leftPercentage }]} />
      <View style={[styles.rightColor, { flex: (1 - leftPercentage) }]} />
    </View>
  );
};

export default LineGraph;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 18,
  },
  leftColor: {
    backgroundColor: 'green',
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
  },
  rightColor: {
    backgroundColor: 'black',
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
  },
});
