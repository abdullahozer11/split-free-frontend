import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  Dialog,
  Portal,
} from "react-native-paper";
import { Button, TextInput, Text, DialogTitle, useTranslatedAlert } from "@/src/components/Translated";
import { DeletableMember } from "@/src/components/Person";
import CustomDropdown from "@/src/components/CustomDropdown"; // Import CustomDropdown
import { useGroup, useUpdateGroup } from "@/src/api/groups";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { currencyOptions } from "@/src/constants/Currencies"; // Import currency options

const UpdateGroup = () => {
  const { alert } = useTranslatedAlert();
  const { group_id: idString } = useLocalSearchParams();
  const groupId = parseInt(
    typeof idString === "string" ? idString : idString[0],
  );
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [removingMemberName, setRemovingMemberName] = useState(null);
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("EUR"); // Add currency state
  const [newMemberName, setNewMemberName] = useState("");
  const [existingMembers, setExistingMembers] = useState([]);
  const [error, setError] = useState("");

  const {
    data: existingGroup,
    isError: fetchError,
    isLoading,
  } = useGroup(groupId);

  const { mutate: updateGroup } = useUpdateGroup();

  useEffect(() => {
    setTitle(existingGroup?.title);
    setDescription(existingGroup?.description);
    setCurrency(existingGroup?.currency || "EUR"); // Set currency from existing group
    setExistingMembers(existingGroup?.members);
  }, [existingGroup]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (fetchError) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  const validateFormData = () => {
    if (!title) {
      console.log("Title is empty");
      alert("Title is empty");
      return false;
    }
    if (!currency) {
      console.log("Currency is empty");
      alert("Currency is required");
      return false;
    }
    return true;
  };

  const validateMemberName = (name) => {
    const found = existingMembers.some((member) => member.name === name);
    if (found) {
      setError("Name is already in the list");
      return false;
    } else {
      setError("");
      return true;
    }
  };

  const onSubmit = () => {
    if (!validateFormData()) {
      console.log("Form data is not valid");
      return;
    }

    const namesOnly = existingMembers.map((member) => member.name);

    updateGroup(
      {
        group_id_input: existingGroup.id,
        title_input: title,
        description_input: description ?? "",
        currency_input: currency, // Include currency in update
        member_names_input: namesOnly,
      },
      {
        onSuccess: async () => {
          console.log("Group updated successfully");
          navigation.goBack();
          await queryClient.invalidateQueries(["groups"]);
          await queryClient.invalidateQueries(["group", existingGroup.id]);
          await queryClient.invalidateQueries(["members", existingGroup.id]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          alert(
            "Error",
            "There was an error updating the group. Please try again.",
          );
        },
      },
    );
  };

  const addNewMember = () => {
    if (!validateMemberName(newMemberName)) {
      return;
    }

    if (newMemberName.trim() !== "") {
      setExistingMembers([
        ...existingMembers,
        { name: newMemberName, role: "member" },
      ]);
      setNewMemberName("");
    }
  };

  const onMemberDelete = (id, name) => {
    setRemovingMemberId(id);
    setRemovingMemberName(name);
    setIsDialogVisible(true);
  };

  const handleRemoveMember = () => {
    setExistingMembers(
      existingMembers.filter((member) => member.id !== removingMemberId),
    );
    setIsDialogVisible(false);
  };

  // Transform currencyOptions to work with CustomDropdown format
  const dropdownCurrencyOptions = currencyOptions.map(option => ({
    label: option.value, // Use the currency code as both label and value
    value: option.value
  }));

  return (
    <SafeAreaView className="flex-1 justify-center mb-[60px]">
      <View className="w-full justify-between items-center flex-row px-4 mt-7">
        <TouchableOpacity
          className="justify-center items-center"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Feather name={"arrow-left"} size={36} />
        </TouchableOpacity>
        <TouchableOpacity
          className="justify-center items-center"
          onPress={() => {
            onSubmit();
          }}
        >
          <Text variant={"headlineMedium"}>Save</Text>
        </TouchableOpacity>
      </View>
      <View className="w-full justify-between items-center flex-row px-4 mt-7">
        <Text variant={"headlineLarge"}>Update Group</Text>
      </View>
      {/* Form for updating group */}
      <View style={{ gap: 10 }} className="justify-center p-5">
        <TextInput
          label="Title"
          placeholder="Enter group name"
          value={title}
          onChangeText={(text) => setTitle(text)}
          className="bg-white"
        />
        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={(text) => setDescription(text)}
          placeholder="Enter group description"
          multiline={true}
          className="bg-white"
        />

        {/* Currency Dropdown */}
        <View className="mb-2">
          <Text className="text-base font-medium mb-2 text-gray-700">Currency</Text>
          <CustomDropdown
            data={dropdownCurrencyOptions}
            value={currency}
            onChange={setCurrency}
            placeholder="Select Currency"
            iconName="dollar-sign"
            containerClassName="w-full"
            dropdownClassName="flex-row items-center border border-gray-300 rounded-md p-4 h-14 justify-between bg-white"
            textClassName="text-base text-gray-800 flex-1 ml-2"
            modalContentClassName="bg-white rounded-md w-3/5 max-h-[300px] p-4"
            itemClassName="p-3 border-b border-gray-200 items-center"
            itemTextClassName="text-base text-gray-800"
          />
        </View>

        <TextInput
          label="New member name"
          value={newMemberName}
          onChangeText={(text) => setNewMemberName(text)}
          placeholder="Add new member"
          className="bg-white"
        />
        {error ? (
          <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        ) : null}
        <Button icon="plus" mode="outlined" onPress={addNewMember}>
          Add Member
        </Button>
        <ScrollView className="px-2">
          {existingMembers.map((member) => (
            <View key={member.name} className="mb-2">
              <DeletableMember
                member={member}
                onDelete={() => onMemberDelete(member.id, member.name)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => {
            setIsDialogVisible(false);
          }}
        >
          <Dialog.Icon icon="alert" />
          <DialogTitle>
            <Text>Are you sure to remove this member from group?</Text>
            <Text>{removingMemberName}</Text>
          </DialogTitle>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleRemoveMember}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default UpdateGroup;
