import {StyleSheet, Text} from 'react-native';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import { AntDesign } from '@expo/vector-icons';

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AntDesign name="arrowleft" size={30} color="white" />
      <Text style={styles.title}>Settings</Text>
      <Text>SettingsScreen</Text>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    padding: 20,
    flex: 1,
  },
  title: {
    marginTop: 30,
    fontSize: 40,
    fontWeight: '500',
    color: 'white',
  },
});
