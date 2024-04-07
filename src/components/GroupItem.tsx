import {StyleSheet, View, Text} from 'react-native';
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const GroupItem = ({group}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.firstRow]}>
        <Text style={styles.title}>{group.title}</Text>
        <FontAwesome size={28} style={{}} name={'star'} />
      </View>
      <View style={styles.row}>
        <View style={{flexDirection: "row"}}>
          <FontAwesome size={22} style={styles.fixWidth} name={'user'} />
          <Text style={{color: 'gray'}}>8 Friends</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={{flexDirection: "row"}}>
          <FontAwesome size={22} style={styles.fixWidth} name={'info'} />
          <Text style={{color: '#aaa'}}>5 Expense</Text>
        </View>
        <Text>Settled!</Text>
      </View>
    </View>
  );
};

export default GroupItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    marginVertical: 7,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  firstRow: {
    marginBottom: 20,
  },
  fixWidth: {
    width: 15,
    textAlign: "center",
    marginRight: 15,
    color: '#aaa',
  },
});
