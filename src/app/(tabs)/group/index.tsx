import { View, ScrollView } from "react-native";
import GroupItem from "@/src/components/GroupItem";
import React, { useState } from "react";
import CreateGroupModal from "@/src/modals/CreateGroup";
import CustomHeader from "@/src/components/CustomHeader";
import { useGroupList } from "@/src/api/groups";
import { Text, ActivityIndicator, TextInput } from "react-native-paper";
import {
  useGroupInviteSubscriptions,
  useGroupSubscriptions,
} from "@/src/api/groups/subscriptions";
import { useAuth } from "@/src/providers/AuthProvider";

const GroupScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [anchoredGroups, setAnchoredGroups] = useState([]);
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [queryKey, setQueryKey] = useState("");
  const {
    data: groups,
    isError: groupsError,
    isLoading: groupsLoading,
  } = useGroupList();

  const { session } = useAuth();
  useGroupSubscriptions();
  useGroupInviteSubscriptions(session?.user.id);

  if (groupsLoading) {
    return <ActivityIndicator />;
  }

  if (groupsError) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  const toggleSearchBarVisible = () => {
    setSearchBarVisible(!searchBarVisible);
    setQueryKey("");
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleAnchor = (group, anchored) => {
    group.anchored = anchored;
    // Update anchored groups state
    if (anchored) {
      setAnchoredGroups([...anchoredGroups, group]);
    } else {
      setAnchoredGroups(anchoredGroups.filter((g) => g.id !== group.id));
    }
  };

  // Filter groups based on queryKey
  const filteredGroups = groups?.filter((group) =>
    group.title.toLowerCase().includes(queryKey.toLowerCase()),
  );

  // Define sections for SectionList
  const sections = [];
  if (anchoredGroups.length > 0) {
    sections.push({ title: "Quick Access", data: anchoredGroups });
  }
  sections.push({
    title: anchoredGroups.length > 0 ? "Other Groups" : "All Groups",
    data: filteredGroups.filter(
      (g) => !anchoredGroups.some((ag) => ag.id === g.id),
    ),
  });

  return (
    <View className={"flex-1"}>
      <CustomHeader
        title={"Groups"}
        handleSearch={toggleSearchBarVisible}
        setIsModalVisible={setIsModalVisible}
      />
      {searchBarVisible && (
        <TextInput
          placeholder={""}
          onChangeText={setQueryKey}
          value={queryKey}
          className={"bg-white mx-2"}
          right={
            <TextInput.Icon icon={"close"} onPress={toggleSearchBarVisible} />
          }
        />
      )}
      <ScrollView className={"px-4 pt-4 flex-1"}>
        {sections.map((section) => {
          if (section.title === "Quick Access") {
            return (
              <View key={section.title} className={"mb-4"}>
                <Text variant={"headlineLarge"} className={"mb-2"}>
                  Quick Access
                </Text>
                {section.data.map((item) => (
                  <GroupItem
                    key={item.id}
                    group={item}
                    onAnchor={(anchored) => handleAnchor(item, anchored)}
                  />
                ))}
              </View>
            );
          } else {
            return (
              <View key={section.title} className={"mb-4"}>
                <Text variant={"headlineLarge"} className={"mb-2"}>
                  {section.title}
                </Text>
                {section.data.map((item) => (
                  <GroupItem
                    key={item.id}
                    group={item}
                    onAnchor={(anchored) => handleAnchor(item, anchored)}
                  />
                ))}
              </View>
            );
          }
        })}
        <CreateGroupModal isVisible={isModalVisible} onClose={closeModal} />
      </ScrollView>
    </View>
  );
};

export default GroupScreen;
