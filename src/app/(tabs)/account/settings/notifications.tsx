import {StyleSheet, View, Text} from 'react-native';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";

const Notifications = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Notifications</Text>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {},
});
