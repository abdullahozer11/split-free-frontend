import { View, ScrollView } from "react-native";
import { TextInput, Text } from "@/src/components/Translated";
import GroupItem, { type GroupListItem } from "@/src/components/GroupItem";
import React, { useState, useEffect } from "react";
import CreateGroupModal from "@/src/modals/CreateGroup";
import CustomHeader from "@/src/components/CustomHeader";
import { useGroupList } from "@/src/api/groups";
import { ActivityIndicator } from "react-native-paper";
import {
  useGroupInviteSubscriptions,
  useGroupSubscriptions,
} from "@/src/api/groups/subscriptions";
import { useAuth } from "@/src/providers/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ANCHORED_GROUPS_STORAGE_KEY = "anchoredGroupIds";

type GroupSection = {
  title: string;
  data: GroupListItem[];
};

const parseAnchoredGroupIds = (value: string): number[] => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is number => typeof id === "number");
  } catch {
    return [];
  }
};

const GroupScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [anchoredGroups, setAnchoredGroups] = useState<GroupListItem[]>([]);
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

  // Load anchored group IDs from AsyncStorage when component mounts
  useEffect(() => {
    const loadAnchoredGroupIds = async () => {
      try {
        const anchoredGroupIdsJson = await AsyncStorage.getItem(
          ANCHORED_GROUPS_STORAGE_KEY,
        );
        if (anchoredGroupIdsJson) {
          const anchoredGroupIds = parseAnchoredGroupIds(anchoredGroupIdsJson);
          if (groups) {
            const anchoredGroupsData = groups
              .filter((group) => anchoredGroupIds.includes(group.id))
              .map((group) => ({ ...group, anchored: true }));
            setAnchoredGroups(anchoredGroupsData);
          }
        }
      } catch (error) {
        console.error("Error loading anchored group IDs:", error);
      }
    };

    if (groups) {
      loadAnchoredGroupIds();
    }
  }, [groups]);

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

  const saveAnchoredGroupIds = async (groupIds: number[]) => {
    try {
      await AsyncStorage.setItem(
        ANCHORED_GROUPS_STORAGE_KEY,
        JSON.stringify(groupIds),
      );
    } catch (error) {
      console.error("Error saving anchored group IDs:", error);
    }
  };

  const handleAnchor = (group: GroupListItem, anchored: boolean) => {
    const updatedGroup = { ...group, anchored };

    let updatedAnchoredGroups: GroupListItem[];
    if (anchored) {
      updatedAnchoredGroups = [...anchoredGroups, updatedGroup];
    } else {
      updatedAnchoredGroups = anchoredGroups.filter((g) => g.id !== group.id);
    }

    setAnchoredGroups(updatedAnchoredGroups);

    const anchoredGroupIds = updatedAnchoredGroups.map((g) => g.id);
    saveAnchoredGroupIds(anchoredGroupIds);
  };

  const matchesQuery = (group: GroupListItem) =>
    group.title.toLowerCase().includes(queryKey.toLowerCase());

  const filteredGroups = groups?.filter(matchesQuery) ?? [];
  const filteredAnchoredGroups = anchoredGroups.filter(matchesQuery);
  const otherGroups = filteredGroups.filter(
    (g) => !anchoredGroups.some((ag) => ag.id === g.id),
  );

  const sections: GroupSection[] = [];
  if (filteredAnchoredGroups.length > 0) {
    sections.push({ title: "Quick Access", data: filteredAnchoredGroups });
  }
  if (otherGroups.length > 0) {
    sections.push({
      title: filteredAnchoredGroups.length > 0 ? "Other Groups" : "All Groups",
      data: otherGroups,
    });
  }

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
