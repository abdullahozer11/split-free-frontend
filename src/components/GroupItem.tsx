import { View, TouchableOpacity, Pressable } from "react-native";
import { Text } from "@/src/components/Translated";
import React, { useState } from "react";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";

const GroupItem = ({ group, onAnchor }) => {
  const [anchored, setAnchored] = useState(group.anchored);

  const handleAnchor = async () => {
    onAnchor(!anchored);
    setAnchored(!anchored);
    return true;
  };

  return (
    <Link href={`/group/${group.id}/details`} asChild>
      <Pressable className="bg-white my-1 py-3 px-3 rounded-lg">
        <View className="flex-row justify-between px-5 mb-5">
          <Text className="text-xl font-medium">{group.title}</Text>
          <TouchableOpacity onPress={handleAnchor}>
            <Feather
              size={28}
              name={"anchor"}
              color={anchored ? "black" : "#aaa"}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between px-5">
          <View className="flex-row">
            <View className={"mr-3"}>
              <FontAwesome size={22} name={"user"} color={"#aaa"} />
            </View>
            <Text className={"text-[#aaa]"}>{group.member_count} </Text>
            <Text className={"text-[#aaa]"}>Members</Text>
          </View>
        </View>
        <View className={"flex-row justify-between mx-5"}>
          <View className={"flex-row"}>
            <View className={"mr-5"}>
              <FontAwesome size={22} name={"info"} color={"#aaa"} />
            </View>
            <Text className={"text-[#aaa]"}>{group.expense_count + " "}</Text>
            <Text className={"text-[#aaa]"}>Expenses</Text>
          </View>
          {group.settled ? (
            <Text className={"text-green-500"}>Settled</Text>
          ) : (
            <Text className={"text-red-500"}>Not settled</Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
};

export default GroupItem;
