import React, {useState} from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal, TouchableOpacity,
} from "react-native";
import {useAuth} from "@/src/providers/AuthProvider";
import {useNavigation} from "expo-router";
import MemberRow from "@/src/components/MemberRow";
import {Feather, Ionicons} from "@expo/vector-icons";

const CreateGroupModal = ({isVisible, onClose, onDraw}) => {
  const [title, setTitle] = useState("");
  const {profile} = useAuth();
  const initialMember = {
    name: profile?.name || "John Doe",
    profile: profile,
  }
  const [members, setMembers] = useState([initialMember]);
  const navigation = useNavigation();

  function addNewMember() {
    console.log("adding new member");
  }

  function removeMember(index) {
    console.log("removing member: ", index);
  }

  const saveData = async () => {
    console.log("saving data");
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
            <Pressable textstyle={styles.done} onPress={saveData}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter Group Name"
            value={title}
            onChangeText={(text) => setTitle(text)}
          />
          <TouchableOpacity style={styles.addParticipants} onPress={onDraw}>
            <Text style={styles.parTitle}>Add Participants</Text>
          </TouchableOpacity>
          <ScrollView>
            {members.map((member, index) => (
              <MemberRow key={index} member={member}/>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
