import {FlatList, StyleSheet, Text} from 'react-native';

import {View} from '@/src/components/Themed';
import {group} from "@/assets/data/group";
import GroupItem from "@/src/components/GroupItem";
import {SafeAreaView} from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";

const GroupScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, styles.transparent]}>
        <Text style={styles.bigTitle}>Group</Text>
        <View style={[styles.iconsContainer, styles.transparent]}>
          {/* Use FontAwesome icons */}
          <View style={[styles.iconContainer, {backgroundColor: "white"}]}>
            <FontAwesome size={24} style={styles.icon} name={'search'} />
          </View>
          <View style={styles.iconContainer}>
            <FontAwesome size={24} style={styles.icon} name={'plus'} />
          </View>
        </View>
      </View>
      <Text style={styles.allGroupsTitle}>All Groups</Text>
      <FlatList
        data={group}
        renderItem={({ item }) => <GroupItem group={item} />}
        keyExtractor={(item) => item.id.toString()} // Key extractor for FlatList
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  transparent: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bigTitle: {
    fontSize: 36,
    fontWeight: '500',
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  icon: {
  },
  iconContainer: {
    marginLeft: 16,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    backgroundColor: "orange",
  },
  allGroupsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default GroupScreen;
