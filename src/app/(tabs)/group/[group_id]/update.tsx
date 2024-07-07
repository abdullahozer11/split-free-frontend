import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  Button,
  TextInput,
  Text,
  Dialog,
  Portal,
} from "react-native-paper";
import { DeletableMember } from "@/src/components/Person";
import { useGroup, useUpdateGroup } from "@/src/api/groups";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

const UpdateGroup = () => {
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
      Alert.alert("Title is empty");
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
          Alert.alert(
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
        <Text variant={"headlineLarge"}>Update Group</Text>
        <TouchableOpacity
          className="justify-center items-center"
          onPress={() => {
            onSubmit();
          }}
        >
          <Text variant={"headlineMedium"}>Save</Text>
        </TouchableOpacity>
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
          <Dialog.Title>
            Are you sure to remove "{removingMemberName}" from group?
          </Dialog.Title>
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
