import {StyleSheet, View, Text} from 'react-native';
import {useLocalSearchParams} from "expo-router";
import React from "react";

const GroupDetailsScreen = () => {
  const {id: idString} = useLocalSearchParams();
  const id = parseFloat(typeof idString === 'string' ? idString : idString[0]);

  return (
    <View style={styles.container}>
      <Text>Group Details Screen</Text>
    </View>
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
