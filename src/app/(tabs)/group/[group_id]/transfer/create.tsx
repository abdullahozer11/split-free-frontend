import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {useLocalSearchParams} from "expo-router";

export default function NewTransfer() {
  const {group_id: idString} = useLocalSearchParams();
  const groupId = parseInt(typeof idString === 'string' ? idString : idString[0]);

  return (
    <SafeAreaView style={styles.container}>
      <Text>Make a form to create a money transfer log</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
