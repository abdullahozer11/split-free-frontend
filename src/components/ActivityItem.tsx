import {StyleSheet, View, Text} from 'react-native';
import React from "react";

const ActivityItem = ({activity}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.time}>{activity.created_at} ago</Text>
      <Text style={styles.activity}>{activity.text}</Text>
      <View style={styles.separator}/>
    </View>
  );
};

export default ActivityItem;

const styles = StyleSheet.create({
  container: {},
  activity: {},
  time: {
    fontWeight: "bold"
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
});
