import {StyleSheet, View, Text, TextInput, Modal, Image, TouchableOpacity, Alert} from 'react-native';
import React, {useState} from "react";
import {Feather} from "@expo/vector-icons";


const Member = ({name, onRemove, owner}) => {
  return (
    <View style={styles.person}>
      <Image source={require('@/assets/images/blank-profile.png')} style={styles.avatar}/>
      <Text style={styles.personName}>{name}</Text>
      {!owner && <TouchableOpacity style={styles.removeIcon} onPress={onRemove}>
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
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Participants</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              style={styles.input}
            />
          </View>
          <TouchableOpacity style={styles.invitationRow} onPress={addMember}>
            <Feather style={styles.icon} name="user-plus" size={24} color="black"/>
            <Text style={styles.text}>Add a new member</Text>
          </TouchableOpacity>
          <Text style={{color: 'red', marginLeft: 20}}>{error}</Text>
          <View style={styles.people}>
            {members.map((member, index) => (
              index === 0 ? (
                <Member key={index} name={member} owner={true}/>
              ) : (
                <Member key={index} name={member} onRemove={() => removeMember(member)} />
              )
            ))}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {
              onSubmit(members);
              resetFields();
            }}>
              <Feather name={"check"} size={24} color="black"/>
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.participantsDisplay}>
          <Text>TODO</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Participants;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "80%",
    height: "100%",
    backgroundColor: "#dddddd",
    gap: 20,
  },
  header: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 50,
    marginBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 40,
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  pModalFooterButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: "center",
    gap: 5,
  },
  buttonText: {
    color: 'black',
    fontSize: 21,
    fontWeight: '600',
  },
  participantsDisplay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  },
  people: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 20,
    gap: 10,
  },
  person: {
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: "white",
    paddingLeft: 30,
  },
  personName: {
    fontSize: 20,
    fontWeight: '600',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  invitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 10,
    backgroundColor: 'green'
  },
  icon: {
    fontSize: 22,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
  nearbyF: {
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 10,
  },
  removeIcon: {
    position: "absolute",
    right: 12,
  },
});
