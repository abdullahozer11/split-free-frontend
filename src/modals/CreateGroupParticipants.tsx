import {StyleSheet, View, Text, TextInput, Modal, Image, TouchableOpacity, Alert} from 'react-native';
import React, {useState} from "react";
import {Feather} from "@expo/vector-icons";


const Member = ({name, onRemove, owner}) => {
  return (
    <View className="p-2.5 flex-row items-center rounded-lg bg-white pl-7" style={{ gap: 10 }}>
      <Image source={require('@/assets/images/blank-profile.png')} className="w-10 h-10 rounded-full mr-2.5"/>
      <Text className="text-lg font-semibold">{name}</Text>
      {!owner && <TouchableOpacity className="absolute right-3" onPress={onRemove}>
        <Feather name="x" size={28} color="red"/>
      </TouchableOpacity>}
    </View>
  );
};

const Participants = ({isVisible, onClose, onSubmit, members: membersP}) => {
  const [name, setName] = useState('');
  const [members, setMembers] = useState(membersP);
  const [error, setError] = useState('');

  const addMember = () => {
    if (!validateMemberName()) {
      return;
    }
    setMembers([...members, name]);
    setName('');
  };

  const removeMember = (memberName) => {
    setMembers(members.filter(member => member !== memberName));
  };

  const validateMemberName = () => {
    if (!name) {
      setError('Enter name first');
      return false;
    }
    if (members.includes(name)) {
      setError('Name is already in the list');
      return false;
    }
    setError('');
    return true;
  };

  const resetFields = () => {
    setMembers([]);
    setName('');
    setError('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]">
        <View className="absolute top-0 right-0 w-[70%] h-full bg-gray-300" style={{ gap: 20 }}>
          <View className="px-5">
            <Text className="text-2xl font-medium mt-12 mb-2.5">Add Participants</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              className="h-12.5 bg-white rounded-lg p-2.5 text-lg"
            />
          </View>
          <TouchableOpacity className="flex-row items-center px-5 border rounded-lg p-1.5 mx-2.5 bg-green-600" style={{ gap: 10 }} onPress={addMember}>
            <Feather className="text-xl" name="user-plus" size={24} color="black"/>
            <Text className="text-lg font-medium">Add a new member</Text>
          </TouchableOpacity>
          <Text className="text-red-500 ml-5">{error}</Text>
          <View className="flex-1 py-1.5 px-5" style={{ gap: 10 }}>
            {members.map((member, index) => (
              index === 0 ? (
                <Member key={index} name={member} owner={true}/>
              ) : (
                <Member key={index} name={member} onRemove={() => removeMember(member)} />
              )
            ))}
          </View>
          <View className="flex-row items-center p-2.5 bg-white absolute bottom-0 w-full" style={{ gap: 40 }}>
            <TouchableOpacity className="bg-transparent p-2.5 mb-4 flex-row items-center" onPress={onClose} style={{ gap: 5 }}>
              <Text className="text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-transparent p-2.5 mb-4 flex-row items-center" onPress={() => {
              onSubmit(members);
              resetFields();
            }} style={{ gap: 5 }}>
              <Feather name={"check"} size={24} color="black"/>
              <Text className="text-lg font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Participants;
