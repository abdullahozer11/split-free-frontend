import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {

  return (
    <SafeAreaView style={styles.container}>
      <Text>hello new expense</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
