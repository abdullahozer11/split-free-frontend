import {Text, StyleSheet, View, Pressable} from 'react-native';
import React from "react";
import {Feather} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";

const CustomHeader = ({handleSearch, setIsModalVisible, title}) => {
  return (
    <SafeAreaView style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.iconsContainer, styles.transparent]}>
        <Pressable onPress={handleSearch} style={[styles.iconContainer, {backgroundColor: "white"}]}>
          <Feather size={42} name={'search'}/>
        </Pressable>
        <Pressable onPress={() => {
          setIsModalVisible(true);
        }} style={styles.iconContainer}>
          <Feather size={42} name={'plus'}/>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    width: "100%",
    height: 130,
    flexDirection: "row",
    padding: 10,
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconContainer: {
    marginLeft: 16,
    borderRadius: 10,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "orange",
  },
  transparent: {
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 40,
  },
});
