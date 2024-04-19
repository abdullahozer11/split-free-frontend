import React, {useState} from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import {Feather} from '@expo/vector-icons';
import Participants from "@/src/modals/CreateGroupParticipants";

const CreateGroupModal = ({isVisible, onClose, onDraw}) => {
  const [title, setTitle] = useState("");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  const saveData = async () => {
    console.log("Saving data");
    // Logic to save group data
  };

  const openParticipantsModal = () => {
    setShowParticipantsModal(true);
  };

  const closeParticipantsModal = () => {
    setShowParticipantsModal(false);
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
          <View style={styles.tabBar}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="black"/>
            </TouchableOpacity>
            <Pressable onPress={saveData}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter Group Name"
            value={title}
            onChangeText={(text) => setTitle(text)}
          />
          <TouchableOpacity style={styles.addParticipants} onPress={openParticipantsModal}>
            <Text style={styles.parTitle}>Add Participants</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showParticipantsModal && ( <Participants isVisible={showParticipantsModal} onClose={closeParticipantsModal}/> )}
    </Modal>
  );
};

export default CreateGroupModal;


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    width: "80%",
    borderRadius: 20,
    padding: 20,
    backgroundColor: "white",
  },
  input: {
    width: "100%",
    height: 60,
    backgroundColor: "white",
    fontWeight: "400",
    fontSize: 22,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  parTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  done: {},
  doneText: {
    fontWeight: "bold",
    fontSize: 20,
  },
  addParticipants: {
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 10,
    marginBottom: 5,
  },
});

export default CreateGroupModal;
