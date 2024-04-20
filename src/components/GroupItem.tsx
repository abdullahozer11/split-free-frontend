import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from "react";
import {Feather, FontAwesome} from "@expo/vector-icons";
import {useDeleteGroup} from "@/src/api/groups";

const GroupItem = ({group, onAnchor}) => {
  const [anchored, setAnchored] = useState(group.anchored);

  const {mutate: deleteGroup} = useDeleteGroup();

  const handleAnchor = async () => {
    onAnchor(!anchored);
    setAnchored(!anchored);
  }

  const handleDelete = () => {
    deleteGroup(group.id, {
      onSuccess: () => {
        // console.log("Successfully deleted group");
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.firstRow]}>
        <Text style={styles.title}>{group.title}</Text>
        <TouchableOpacity onPress={handleAnchor}>
          <Feather size={28} style={anchored ? styles.anchorIcon : styles.unanchorIcon} name={'anchor'}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Feather size={28} name={'trash-2'} color={'maroon'}/>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={{flexDirection: "row"}}>
          <FontAwesome size={22} style={styles.fixWidth} name={'user'}/>
          <Text style={{color: 'gray'}}>{group['members'][0]['count']} Friends</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={{flexDirection: "row"}}>
          <FontAwesome size={22} style={styles.fixWidth} name={'info'}/>
          <Text style={{color: '#aaa'}}>{group['expenses'][0]['count']} Expenses</Text>
        </View>
        <Text style={{color: group.status === 'settled' ? 'green' : 'red'}}>{group.status}</Text>
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
  anchorIcon: {
    opacity: 1,
  },
  unanchorIcon: {
    opacity: 0.3,
  }
});
