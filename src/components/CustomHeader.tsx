import {StyleSheet, View, Pressable} from 'react-native';
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const CustomHeader = ({handleSearch, setIsModalVisible}) => {
  return (
    <View style={[styles.iconsContainer, styles.transparent]}>
      <Pressable onPress={handleSearch} style={[styles.iconContainer, {backgroundColor: "white"}]}>
        <FontAwesome size={24} name={'search'}/>
      </Pressable>
      <Pressable onPress={() => {
        setIsModalVisible(true);
      }} style={styles.iconContainer}>
        <FontAwesome size={24} name={'plus'}/>
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
    paddingVertical: 10,
    paddingHorizontal: 13,
    backgroundColor: "orange",
  },
  transparent: {
    backgroundColor: "transparent",
  },
});
