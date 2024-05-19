import React, {useEffect, useState} from "react";
import {StyleSheet, View, ScrollView, TouchableOpacity, Alert} from "react-native";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {ActivityIndicator, Button, TextInput, Text, Dialog, Portal} from "react-native-paper";
import {DeletableMember} from "@/src/components/Person";
import {useGroup, useUpdateGroup} from "@/src/api/groups";
import {Feather} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {useQueryClient} from "@tanstack/react-query";

const UpdateGroup = () => {
  const {group_id: idString} = useLocalSearchParams();
  const groupId = parseInt(typeof idString === "string" ? idString : idString[0]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [removingMemberName, setRemovingMemberName] = useState(null);
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [existingMembers, setExistingMembers] = useState([]);
  const [error, setError] = useState('');

  const {data: existingGroup, error: fetchError, isLoading} = useGroup(groupId);

  const {mutate: updateGroup} = useUpdateGroup();

  useEffect(() => {
    setTitle(existingGroup.title);
    setDescription(existingGroup.description);
    setExistingMembers(existingGroup.members);
  }, [existingGroup]);

  // console.log("existing members are ", existingMembers);

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (fetchError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  const validateFormData = () => {
    if (!title) {
      console.log('Title is empty');
      Alert.alert('Title is empty');
      return false;
    }
  };

  const validateMemberName = (name) => {
    const found = existingMembers.some(member => member.name === name);
    if (found) {
      setError('Name is already in the list');
      return false;
    } else {
      return true;
    }
  };

  const onSubmit = () => {
    if (!validateFormData) {
      console.log("Form data is not valid");
      return;
    }

    const namesOnly: string[] = existingMembers.map(member => member.name);

    updateGroup({
      group_id_input: existingGroup.id,
      title_input: title,
      description_input: description ?? '',
      member_names_input: namesOnly,
    }, {
      onSuccess: async () => {
        console.log("Group updated successfully");
        navigation.goBack();
        await queryClient.invalidateQueries(['groups']);
        await queryClient.invalidateQueries(['group', existingGroup.id]);
        await queryClient.invalidateQueries(['members', existingGroup.id]);
      },
    });
  };

  const addNewMember = () => {
    if (!validateMemberName(newMemberName)) {
      // console.log("member name is not valid");
      return;
    }

    // console.log("member name is valid");

    if (newMemberName.trim() !== "") {
      setExistingMembers([...existingMembers, {name: newMemberName, role: "member"}]);
      setNewMemberName("");
    }
  };

  const onMemberDelete = (id, name) => {
    setRemovingMemberId(id);
    setRemovingMemberName(name);
    setIsDialogVisible(true);
  };

  const handleRemoveMember = () => {
    setExistingMembers(existingMembers.filter((member) => member.id !== removingMemberId));
    setIsDialogVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconContainer} onPress={() => {
          navigation.goBack();
        }}>
          <Feather name={"arrow-left"} size={36}/>
        </TouchableOpacity>
        <Text variant={'headlineLarge'}>Update Group</Text>
        <TouchableOpacity style={styles.backIconContainer} onPress={() => {
          onSubmit();
        }}>
          <Text variant={"headlineMedium"}>Save</Text>
        </TouchableOpacity>
      </View>
      {/* Form for updating group */}
      <View style={styles.formContainer}>
        <TextInput
          label="Title"
          placeholder="Enter group name"
          value={title}
          onChangeText={(text) => setTitle(text)}
          style={{backgroundColor: 'white'}}
        />
        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={(text) => setDescription(text)}
          placeholder="Enter group description"
          multiline={true}
          style={{backgroundColor: 'white'}}
        />
        <TextInput
          label="New member name"
          value={newMemberName}
          onChangeText={(text) => setNewMemberName(text)}
          placeholder="Add new member"
          style={{backgroundColor: 'white'}}
        />
        <Button icon="plus" mode="outlined" onPress={addNewMember}>Add Member</Button>
        <ScrollView style={styles.memberList}>
          {existingMembers.map((member) => (
            <View key={member.name} style={styles.memberContainer}>
              <DeletableMember member={member} onDelete={() => onMemberDelete(member.id, member.name)}/>
            </View>
          ))}
        </ScrollView>
      </View>
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => {
          setIsDialogVisible(false);
        }}>
          <Dialog.Icon icon="alert"/>
          <Dialog.Title>Are you sure to remove "{removingMemberName}" from group?</Dialog.Title>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  memberList: {
    paddingHorizontal: 10,
  },
  memberContainer: {
    marginBottom: 10,
  },
  header: {
    width: '100%',
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 30,
  },
  backIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  }
});
