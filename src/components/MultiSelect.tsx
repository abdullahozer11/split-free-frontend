import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Text } from "@/src/components/Translated";
import { Feather } from "@expo/vector-icons";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider.js";

const MultiSelect = ({ selected, members, onChange }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // Filter members based on search text
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Get selected member names for display
  const selectedMembers = members.filter((member) =>
    selected.includes(member.id),
  );
  const displayText =
    selectedMembers.length > 0
      ? selectedMembers.map((member) => member.name).join(", ")
      : int["Select participants"];

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
    if (!isDropdownVisible) {
      setSearchText("");
    }
  };

  const handleItemPress = (itemId) => {
    const newSelected = selected.includes(itemId)
      ? selected.filter((id) => id !== itemId)
      : [...selected, itemId];
    onChange(newSelected);
  };

  const handleDone = () => {
    setIsDropdownVisible(false);
    setSearchText("");
  };

  const renderItem = (item) => {
    const isSelected = selected.includes(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleItemPress(item.id)}
        className="flex-row h-16 px-3 py-2 justify-between items-center border-b border-gray-100"
        activeOpacity={0.7}
      >
        <Text variant="bodyLarge">{item.name}</Text>
        {isSelected && <Feather color="green" name="check" size={24} />}
      </TouchableOpacity>
    );
  };

  return (
    <View className="rounded-md border-[0.5px] border-gray-300 bg-white p-2">
      <Text variant="titleMedium" className="pl-2 pt-2">
        Who shares this expense?
      </Text>

      {/* Main selector button */}
      <TouchableOpacity
        onPress={toggleDropdown}
        className="flex-row items-center justify-between pl-7 pr-2 mt-2 py-3 bg-white border-b border-gray-200"
        activeOpacity={0.7}
      >
        <Text
          variant="bodyMedium"
          className={`flex-1 ${selectedMembers.length === 0 ? "text-gray-500" : "text-black font-semibold"}`}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <View className="flex-row items-center">
          {selectedMembers.length > 0 && (
            <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
              <Text variant="labelSmall" className="text-blue-700 font-medium">
                {selectedMembers.length}
              </Text>
            </View>
          )}
          <Feather
            name={isDropdownVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDone}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={handleDone}
        >
          <View className="flex-1 justify-center px-4">
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-h-96 shadow-lg"
            >
              {/* Header with search */}
              <View className="p-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-3">
                  <Text variant="titleMedium" className="flex-1">
                    {int["Select participants"]}
                  </Text>
                  <TouchableOpacity onPress={handleDone}>
                    <Text variant="labelLarge" className="font-medium">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Search input */}
                <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                  <Feather name="search" size={16} color="#666" />
                  <TextInput
                    className="flex-1 ml-2 text-base"
                    placeholder={int["Search..."]}
                    value={searchText}
                    onChangeText={setSearchText}
                    style={{ fontSize: 16 }}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")}>
                      <Feather name="x" size={16} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Items list */}
              <ScrollView className="max-h-64">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(renderItem)
                ) : (
                  <View className="p-4 items-center">
                    <Text variant="bodyMedium" className="text-gray-500">
                      No members found
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Footer with selected count */}
              {selectedMembers.length > 0 && (
                <View className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <Text
                    variant="labelMedium"
                    className="text-gray-600 text-center"
                  >
                    <Text>
                      {selectedMembers.length}<Text> </Text>
                    </Text>
                    {selectedMembers.length !== 1 ? <Text>
                      participants
                    </Text> : <Text>
                      participant
                    </Text>}
                    <Text> </Text>
                    <Text>selected</Text>
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MultiSelect;
