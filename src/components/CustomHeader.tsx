import {StyleSheet, View, Pressable} from 'react-native';
import React from "react";
import {Feather} from "@expo/vector-icons";

const CustomHeader = ({handleSearch, setIsModalVisible}) => {
  return (
    <View style={[styles.iconsContainer, styles.transparent]}>
      <Pressable onPress={handleSearch} style={[styles.iconContainer, {backgroundColor: "white"}]}>
        <Feather  size={32} name={'search'}/>
      </Pressable>
      <Pressable onPress={() => {
        setIsModalVisible(true);
      }} style={styles.iconContainer}>
        <Feather size={32} name={'plus'}/>
      </Pressable>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  iconsContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconContainer: {
    marginLeft: 16,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 9,
    backgroundColor: "orange",
  },
  transparent: {
    backgroundColor: "transparent",
  },
});
