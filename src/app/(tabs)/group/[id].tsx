import {StyleSheet, View, Text} from 'react-native';
import {useLocalSearchParams} from "expo-router";
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";

const GroupDetailsScreen = () => {
  const {id: idString} = useLocalSearchParams();
  const id = parseFloat(typeof idString === 'string' ? idString : idString[0]);

  return (
    <SafeAreaView style={styles.container}>
      <Text>Group Details Screen for group id: {id}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
  },
})

export default GroupDetailsScreen
