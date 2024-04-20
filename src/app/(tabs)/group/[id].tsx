import {StyleSheet, View, Text} from 'react-native';
import {useLocalSearchParams} from "expo-router";
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import CollapsableHeader from "@/src/components/CollapsableHeader";

const GroupDetailsScreen = () => {
  const {id: idString} = useLocalSearchParams();
  const id = parseFloat(typeof idString === 'string' ? idString : idString[0]);

  return (
    <View style={styles.container}>
      <CollapsableHeader content={
        <>
          <View style={{ padding: 20, height: 200, backgroundColor: "red" }}>
            <Text>View 1</Text>
          </View>

          <View style={{ padding: 20, height: 200, backgroundColor: "yellow" }}>
            <Text>View 1</Text>
          </View>
          <View style={{ padding: 20, height: 200, backgroundColor: "green" }}>
            <Text>View 1</Text>
          </View>
          <View style={{ padding: 20, height: 200, backgroundColor: "red" }}>
            <Text>View 1</Text>
          </View>
          <View style={{ padding: 20, height: 200, backgroundColor: "blue" }}>
            <Text>View 1</Text>
          </View>
        </>
      }/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
});

export default GroupDetailsScreen;
