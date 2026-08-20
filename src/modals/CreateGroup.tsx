import React, { useEffect, useState } from "react";
import { View, Pressable, Modal, TouchableOpacity, Alert } from "react-native";
import { TextInput, Text } from "@/src/components/Translated";
import { Feather } from "@expo/vector-icons";
import Participants from "@/src/modals/CreateGroupParticipants";
import { useAuth } from "@/src/providers/AuthProvider";
import { useInsertGroup } from "@/src/api/groups";
import { useProfile } from "@/src/api/profiles";
import { ActivityIndicator } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { currencyOptions } from "@/src/constants";

type CreateGroupModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const ownerName = (fullName: string | null | undefined): string[] =>
  fullName ? [fullName] : [];

const CreateGroupModal = ({ isVisible, onClose }: CreateGroupModalProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [error, setError] = useState("");

  const { mutate: insertGroup } = useInsertGroup();

  const { setSession, session } = useAuth();
  const {
    data: profile,
    isLoading,
    isError,
  } = useProfile(session?.user.id ?? "");
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    setMembers(ownerName(profile?.full_name));
  }, [profile]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    setSession(null);
    return <Text>Failed to fetch data</Text>;
  }

  const handleParticipantsSubmit = (nextMembers: string[]) => {
    setShowParticipantsModal(false);
    setMembers(nextMembers);
  };

  const resetFields = () => {
    setTitle("");
    setCurrency("EUR");
    setMembers(ownerName(profile?.full_name));
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
          await queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert(
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

  const currencies = currencyOptions.map((option) => option.value);

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
          <View className="flex-row items-center border-b border-gray-300">
            <TextInput
              className="flex-1 h-15 bg-white font-normal text-2xl px-2.5"
              placeholder="Enter Group Name"
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
            <TouchableOpacity
              onPress={() => setShowCurrencyModal(true)}
              className="px-4"
            >
              <Text className="text-2xl font-normal">{currency}</Text>
            </TouchableOpacity>
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
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="bg-white p-4 rounded-lg w-[60%]">
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr}
                onPress={() => {
                  setCurrency(curr);
                  setShowCurrencyModal(false);
                }}
                className="py-2 items-center"
              >
                <Text className="text-lg">{curr}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default CreateGroupModal;
