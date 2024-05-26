import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {useLocalSearchParams} from "expo-router";
import {Text, ActivityIndicator} from "react-native-paper";

export default function UpdateTransfer() {
  const {group_id: groupIdString, transfer_id: transferIdString} = useLocalSearchParams();
  const transferId = parseInt(typeof transferIdString === 'string' ? transferIdString : transferIdString[0]);
  const group_id = parseInt(typeof groupIdString === 'string' ? groupIdString : groupIdString[0]);

  return (
    <SafeAreaView style={styles.container}>
      <Text>Update</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
