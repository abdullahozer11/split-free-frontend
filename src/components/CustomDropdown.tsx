import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

const CustomDropdown = ({
  data,
  value,
  onChange,
  placeholder = "Select an option",
  iconName = null,
  containerClassName = "w-full",
  dropdownClassName = "flex-row items-center border border-gray-300 rounded-md p-4 h-20 justify-between bg-white",
  labelClassName = "font-semibold mb-1",
  textClassName = "text-base text-gray-800 flex-1 ml-2",
  modalContentClassName = "bg-white rounded-md w-4/5 max-h-[400px] p-4",
  itemClassName = "p-4 border-b border-gray-200",
  itemTextClassName = "text-base text-gray-800",
  closeButtonClassName = "p-4 items-center",
  closeButtonTextClassName = "text-base font-medium",
  renderItem = null,
  label = null,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const internalRenderItem = ({ item }) => (
    <TouchableOpacity
      className={itemClassName}
      onPress={() => {
        onChange(item.value);
        setModalVisible(false);
      }}
    >
      {renderItem ? (
        renderItem(item)
      ) : (
        <Text className={itemTextClassName}>{item.label}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className={containerClassName}>
      <TouchableOpacity
        className={dropdownClassName}
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-1">
          {label && <Text className={labelClassName}>{label}</Text>}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {iconName && <Feather name={iconName} size={20} color="black" />}
              <Text className={textClassName}>
                {data.find((item) => item.value === value)?.label ||
                  placeholder}
              </Text>
            </View>
            <Feather name="chevron-down" size={20} color="black" />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className={modalContentClassName}>
            <FlatList
              data={data}
              renderItem={internalRenderItem}
              keyExtractor={(item) => item.value}
              className="flex-grow-0"
            />
            <TouchableOpacity
              className={closeButtonClassName}
              onPress={() => setModalVisible(false)}
            >
              <Text className={closeButtonTextClassName}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomDropdown;
