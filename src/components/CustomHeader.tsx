import { View, Pressable } from "react-native";
import { Text } from "@/src/components/Translated";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type CustomHeaderProps = {
  handleSearch: () => void;
  setIsModalVisible: (visible: boolean) => void;
  title: string;
};

const CustomHeader = ({
  handleSearch,
  setIsModalVisible,
  title,
}: CustomHeaderProps) => {
  return (
    <SafeAreaView
      className={
        "bg-gray-100 w-full flex-row p-13 items-end justify-between pb-3"
      }
    >
      <Text variant={"displayMedium"} className={"ml-2"}>
        {title}
      </Text>
      <View className={"flex-row mr-2 bg-transparent"}>
        <Pressable
          onPress={handleSearch}
          className={
            "ml-2 w-16 h-16 justify-center items-center bg-white rounded-md"
          }
        >
          <Feather size={42} name={"search"} />
        </Pressable>
        <Pressable
          onPress={() => {
            setIsModalVisible(true);
          }}
          className={
            "ml-2 w-16 h-16 justify-center items-center bg-orange-300 rounded-md"
          }
        >
          <Feather size={42} name={"plus"} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;
