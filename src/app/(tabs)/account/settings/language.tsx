import {StyleSheet, View, Text} from 'react-native';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";

const LanguageScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>LanguageScreen</Text>
    </SafeAreaView>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  container: {},
});
