import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import { TextInput, Text, useTranslatedAlert } from "@/src/components/Translated";
import { Feather } from "@expo/vector-icons";
import Participants from "@/src/modals/CreateGroupParticipants";
import CustomDropdown from "@/src/components/CustomDropdown"; // Import the CustomDropdown
import { useAuth } from "@/src/providers/AuthProvider";
import { useInsertGroup } from "@/src/api/groups";
import { useProfile } from "@/src/api/profiles";
import { ActivityIndicator } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { currencyOptions } from "@/src/constants/Currencies";

const CreateGroupModal = ({ isVisible, onClose }) => {
  const { alert } = useTranslatedAlert();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [error, setError] = useState("");

  const { mutate: insertGroup } = useInsertGroup();

  const { setSession, session } = useAuth();
  const { data: profile, isLoading, isError } = useProfile(session?.user.id);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    setMembers([profile?.full_name]);
  }, [profile]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    setSession(null);
    return <Text>Failed to fetch data</Text>;
  }

  const handleParticipantsSubmit = (members) => {
    setShowParticipantsModal(false);
    setMembers(members);
  };

  const resetFields = () => {
    setTitle("");
    setCurrency("EUR");
    setMembers([profile?.full_name]);
  };

  const handleCreateGroup = async () => {
    if (!validateData()) {
      console.log("Invalid group data");
      return;
    }
    // Save group in the database
    insertGroup(
      {
        title,
        currency,
        member_names: members,
      },
      {
        onSuccess: async () => {
          resetFields();
          onClose();
          await queryClient.invalidateQueries(["groups"]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          alert(
            "Error",
            "There was an error saving the group. Please try again.",
          );
        },
      },
    );
  };

  const validateData = () => {
    setError("");
    if (!title) {
      setError("Group name cannot be empty");
      return false;
    }
    if (!currency) {
      setError("Currency cannot be empty");
      return false;
    }
    return true;
  };

  const openParticipantsModal = () => {
    setShowParticipantsModal(true);
  };

  const closeParticipantsModal = () => {
    setShowParticipantsModal(false);
  };

  // Transform currencyOptions to work with CustomDropdown format
  const dropdownCurrencyOptions = currencyOptions.map(option => ({
    label: option.value, // Use the currency code as both label and value
    value: option.value
  }));

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="w-[80%] rounded-2xl p-5 bg-white">
          <View className="flex-row justify-between mx-[10px] mb-[10px] items-center">
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
            <Pressable onPress={handleCreateGroup}>
              <Text className="font-bold text-xl">Save</Text>
            </Pressable>
          </View>

          <View className="mb-4">
            <TextInput
              className="h-15 bg-white font-normal text-2xl px-2.5 border-b border-gray-300"
              placeholder="Enter Group Name"
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
          </View>

          <View className="mb-4">
            <CustomDropdown
              data={dropdownCurrencyOptions}
              value={currency}
              onChange={setCurrency}
              placeholder="Select Currency"
              iconName="dollar-sign"
              containerClassName="w-full"
              dropdownClassName="flex-row items-center border border-gray-300 rounded-md p-4 h-16 justify-between bg-white"
              textClassName="text-xl font-normal flex-1 ml-2"
              modalContentClassName="bg-white rounded-md w-3/5 max-h-[300px] p-4"
              itemClassName="p-3 border-b border-gray-200 items-center"
              itemTextClassName="text-lg text-gray-800"
            />
          </View>

          <TouchableOpacity
            className="mt-2.5 justify-center items-center rounded-2xl border border-dashed py-2.5 mb-1.5"
            onPress={openParticipantsModal}
          >
            <Text className="text-xl font-medium">Add Participants</Text>
          </TouchableOpacity>

          <Text className="text-red-500">{error}</Text>
        </View>
      </View>

      {showParticipantsModal && (
        <Participants
          isVisible={showParticipantsModal}
          onClose={closeParticipantsModal}
          onSubmit={handleParticipantsSubmit}
          members={members}
        />
      )}
    </Modal>
  );
};

export default CreateGroupModal;
