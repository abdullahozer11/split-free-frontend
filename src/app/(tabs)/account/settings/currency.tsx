import {StyleSheet, View, Text} from 'react-native';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";

const Currency = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Currency</Text>
    </SafeAreaView>
  );
};

export default Currency;

const styles = StyleSheet.create({
  container: {},
});
