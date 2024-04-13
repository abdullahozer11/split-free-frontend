import {StyleSheet, View, Text, Image} from 'react-native';
import React from "react";

const ActivityItem = ({activity}) => {
  return (
    <View style={styles.container}>
      <Image
        source={activity.member?.profile.avatar_url ? {uri: activity.member?.profile.avatar_url} : require('@/assets/images/blank-profile.png')}
        style={styles.avatar}/>
      <Text style={styles.activity}>{activity.text}</Text>
    </View>
  );
};

export default ActivityItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  activity: {},
  time: {
    fontWeight: "bold"
  },
  separator: {
    height: 1,
    backgroundColor: "black",
    marginVertical: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
  },
});
