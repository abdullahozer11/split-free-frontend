import {Text, View, StyleSheet, TextInput, Pressable, ScrollView} from 'react-native';

import React, {useState} from "react";
import {useAuth} from "@/src/providers/AuthProvider";
import {useNavigation} from "expo-router";
import {Icon} from "react-native-elements";
import Button from '@/src/components/Button';

const CreateGroupScreen = ({}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState([]);
  const {profile} = useAuth();
  const navigation = useNavigation();

  function addNewMember() {
    console.log('adding new member');
  }

  function removeMember(index) {
    console.log('removing member: ', index);
  }

  const saveData = async () => {
    console.log('saving data');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.groupNameInput}
        placeholder="Group title"
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      <TextInput
        style={[styles.groupNameInput, {minHeight: 100}]}
        placeholder="Group description"
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <Text>Who was in the group?</Text>
      <View style={styles.participantContainer}>
        <TextInput
          style={styles.participantNamePrompt}
          placeholder={members.length ? 'Enter others' : 'Enter your name'}
          value={memberName}
          onChangeText={(text) => setMemberName(text)}
        />
        <Pressable onPress={addNewMember}>
          <View style={styles.addParticipantButton}>
            <Text style={styles.addParticipantButtonText}>Add</Text>
          </View>
        </Pressable>
      </View>
      <ScrollView style={styles.participantsContainer}>
        {members.map((participant, index) => (
          <View key={index} style={styles.participantItem}>
            <Text>{participant}</Text>
            <Pressable onPress={() => removeMember(index)}>
              <Icon name="times-circle" size={20} color="red"/>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttons}>
        <Button style={styles.button} text="Back" mode="flat" onPressed={() => navigation.goBack()}/>
        <Button style={styles.button} text={'Save'} onPressed={saveData}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderRadius: 200,
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
  },
  namePrompt: {
    fontSize: 20,
    marginBottom: 10,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  participantNamePrompt: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  participantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addParticipantButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  addParticipantButtonText: {
    color: 'black',
  },
  participantsContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    minHeight: 60,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent:'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 10,
  },
  button: {
    flex: 1,
  },
});

export default CreateGroupScreen;
