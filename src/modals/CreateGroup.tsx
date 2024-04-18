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
import Button from '@/src/components/Button';

const CreateGroupModal = ({isVisible, onClose, onDraw}) => {
  const [title, setTitle] = useState("");
  const [members, setMembers] = useState([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [memberName, setMemberName] = useState();

  const addNewMember = () => {
    console.log("Adding new member");
    // Logic to add a new member
  };

  const removeMember = (index) => {
    console.log("Removing member:", index);
    // Logic to remove a member
  };

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
          <ScrollView>
            {members.map((member, index) => (
              <Text>{member}</Text>
            ))}
          </ScrollView>
        </View>
      </View>
      {showParticipantsModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showParticipantsModal}
          onRequestClose={closeParticipantsModal}
        >
          <View style={styles.modalContainer2}>
            <View style={styles.container2}>
              <View style={styles.pModalInnerHeader}>
                <Text style={styles.pModalTitle}>Add Participants</Text>
                <TextInput
                  value={memberName}
                  onChangeText={setMemberName}
                  placeholder="Member Name"
                  style={styles.pModalInput}
                />
              </View>
              <View style={styles.pModalFooter}>
                <Button style={styles.pModalBtn} textStyle={styles.pModalBtnText} text="Cancel"
                        onPress={closeParticipantsModal}/>
                <Button style={styles.pModalBtn} textStyle={styles.pModalBtnText} text="Done"
                        onPress={closeParticipantsModal}/>
              </View>
            </View>
            <View style={styles.container3}>
              <Text>TODO</Text>
            </View>
          </View>
        </Modal>
      )}
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
  modalContainer2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container2: {
    position: "absolute",
    top: "2%",
    right: 0,
    width: "70%",
    height: "96%",
    borderTopStartRadius: 20,
    borderBottomStartRadius: 20,
    padding: 20,
    backgroundColor: "gainsboro",
    justifyContent: "space-between",
  },
  pModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
  },
  pModalInput: {
    width: 200,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  pModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 40,
  },
  pModalFooterButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  pModalBtn: {
    backgroundColor: 'transparent',
    padding: 10,
    marginBottom: 16,
  },
  pModalBtnText: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
  container3: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  },
});

export default CreateGroupModal;
