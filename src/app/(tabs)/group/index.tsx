import { View, ScrollView } from "react-native";
import { TextInput, Text, useTranslatedAlert } from "@/src/components/Translated";
import GroupItem from "@/src/components/GroupItem";
import React, { useRef, useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/src/lib/supabase";
import { Modal } from "react-native";
import Button from "@/src/components/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/src/api/profiles";

const ANCHORED_GROUPS_STORAGE_KEY = "anchoredGroupIds";

const GroupScreen = () => {
  const {alert} = useTranslatedAlert();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [anchoredGroups, setAnchoredGroups] = useState([]);
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [queryKey, setQueryKey] = useState("");
  const {
    data: groups,
    isError: groupsError,
    isLoading: groupsLoading,
  } = useGroupList();

  const {session} = useAuth();
  useGroupSubscriptions();
  useGroupInviteSubscriptions(session?.user.id);
  const queryClient = useQueryClient();

  // Enhanced refs to prevent dual modal issues
  const hasCheckedNameRef = useRef(false);
  const isProcessingNameUpdateRef = useRef(false);
  const nameModalShownRef = useRef(false);

  // New states for name choice modal
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [chosenName, setChosenName] = useState("");

  // Load anchored group IDs from AsyncStorage when component mounts
  useEffect(() => {
    const loadAnchoredGroupIds = async () => {
      try {
        const anchoredGroupIdsJson = await AsyncStorage.getItem(ANCHORED_GROUPS_STORAGE_KEY);
        if (anchoredGroupIdsJson) {
          const anchoredGroupIds = JSON.parse(anchoredGroupIdsJson);
          // Wait for groups to be loaded before setting anchored groups
          if (groups) {
            const anchoredGroupsData = groups.filter(group =>
              anchoredGroupIds.includes(group.id)
            ).map(group => ({...group, anchored: true}));
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

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfile(session?.user.id);

  // Memoized function to check profile name to prevent unnecessary re-execution
  const checkProfileName = useCallback(() => {
    // Prevent multiple checks and modal openings
    if (hasCheckedNameRef.current || nameModalShownRef.current || isProcessingNameUpdateRef.current) {
      return;
    }

    if (!profile || !session?.user.id) {
      return;
    }

    // If profile exists but full_name is null, empty, or "Anonymous", prompt for name
    if (!profile?.full_name || profile.full_name.trim() === "" || profile.full_name === "Anonymous") {
      hasCheckedNameRef.current = true;
      nameModalShownRef.current = true;
      setNameModalVisible(true);
    } else {
      hasCheckedNameRef.current = true;
    }
  }, [profile, session?.user.id]);

  // Fetch profile and check full_name
  useEffect(() => {
    checkProfileName();
  }, [checkProfileName]);

  if (groupsLoading || profileLoading) {
    return <ActivityIndicator/>;
  }

  if (groupsError || profileError) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  const toggleSearchBarVisible = () => {
    setSearchBarVisible(!searchBarVisible);
    setQueryKey("");
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Save anchored group IDs to AsyncStorage
  const saveAnchoredGroupIds = async (groupIds) => {
    try {
      await AsyncStorage.setItem(ANCHORED_GROUPS_STORAGE_KEY, JSON.stringify(groupIds));
    } catch (error) {
      console.error("Error saving anchored group IDs:", error);
    }
  };

  const handleAnchor = (group, anchored) => {
    // Update the group's anchored state
    const updatedGroup = {...group, anchored};

    // Update anchored groups state
    let updatedAnchoredGroups;
    if (anchored) {
      updatedAnchoredGroups = [...anchoredGroups, updatedGroup];
    } else {
      updatedAnchoredGroups = anchoredGroups.filter((g) => g.id !== group.id);
    }

    setAnchoredGroups(updatedAnchoredGroups);

    // Save the updated anchored group IDs to AsyncStorage
    const anchoredGroupIds = updatedAnchoredGroups.map(g => g.id);
    saveAnchoredGroupIds(anchoredGroupIds);
  };

  // Enhanced name submission handler with better error handling and duplicate prevention
  const handleNameSubmit = async () => {
    if (!chosenName.trim() || isProcessingNameUpdateRef.current) {
      return;
    }

    isProcessingNameUpdateRef.current = true;

    try {
      const {error} = await supabase
        .from("profiles")
        .update({full_name: chosenName.trim()})
        .eq("id", session?.user.id);

      if (error) {
        alert("Failed to update name: " + error.message);
        return;
      }

      // Optimistic update: Immediately set the new profile data in cache
      queryClient.setQueryData(["profile", session?.user.id], (oldProfile) => ({
        ...oldProfile,
        full_name: chosenName.trim(),
      }));

      setNameModalVisible(false);
      setChosenName(""); // Reset for future use
      nameModalShownRef.current = false; // Allow future checks if needed
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update name: ", "Please try again.");
    } finally {
      isProcessingNameUpdateRef.current = false;
    }
  };

  // Enhanced modal close handler
  const handleNameModalClose = () => {
    if (chosenName.trim() || !nameModalShownRef.current) {
      setNameModalVisible(false);
      nameModalShownRef.current = false;
    } else {
      alert("Please choose a name to continue.");
    }
  };

  // Filter groups based on queryKey
  const filteredGroups = groups?.filter((group) =>
    group.title.toLowerCase().includes(queryKey.toLowerCase()),
  );

  // Define sections for SectionList
  const sections = [];
  if (anchoredGroups.length > 0) {
    sections.push({title: "Quick Access", data: anchoredGroups});
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
            <TextInput.Icon icon={"close"} onPress={toggleSearchBarVisible}/>
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
        <CreateGroupModal isVisible={isModalVisible} onClose={closeModal}/>
      </ScrollView>

      {/* Enhanced Modal for forcing name choice with better duplicate prevention */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={nameModalVisible}
        onRequestClose={handleNameModalClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-lg w-4/5">
            <Text className="text-lg font-bold mb-2.5">Choose a name</Text>
            <Text className="mb-2.5">Enter a name to identify yourself (required):</Text>
            <TextInput
              value={chosenName}
              onChangeText={setChosenName}
              placeholder="Your name"
              className="border border-gray-400 bg-white rounded-md text-sm h-11 mb-2.5"
              autoFocus={true}
            />
            <Button
              disabled={!chosenName.trim() || isProcessingNameUpdateRef.current}
              onPress={handleNameSubmit}
              text={isProcessingNameUpdateRef.current ? "Submitting..." : "Submit"}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupScreen;
