import {View, StyleSheet, SectionList, TextInput, Animated, TouchableOpacity} from 'react-native';
import {group} from "@/assets/data/group";
import GroupItem from "@/src/components/GroupItem";
import React, {useRef, useState} from "react";
import {Text} from "@/src/components/Themed";
import CreateGroupModal from "@/src/modals/CreateGroup";
import CustomHeader from "@/src/components/CustomHeader";
import Button from "@/src/components/Button";

const GroupScreen = ({}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [anchoredGroups, setAnchoredGroups] = useState([]);

  const closeModal = () => {
    setIsModalVisible(false);
  };

  function handleSearch() {
    console.log('searching');
  }

  const handleAnchor = (group, anchored) => {
    group.anchored = anchored;
    // Update anchored groups state
    if (anchored) {
      setAnchoredGroups([...anchoredGroups, group]);
    } else {
      setAnchoredGroups(anchoredGroups.filter(g => g.id !== group.id));
    }
  };

  // Define sections for SectionList
  const sections = [];
  if (anchoredGroups.length > 0) {
    sections.push({title: "Quick Access", data: anchoredGroups});
  }
  sections.push({title: "All Groups", data: group.filter(g => !anchoredGroups.some(ag => ag.id === g.id))});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(0)).current;
  const [name, setName] = useState('');
  const [newParticipants, setNewParticipants] = useState([]);

  const toggleDrawer = () => {
    console.log('toggle drawer');
    const toValue = drawerOpen ? 0 : 1;
    Animated.timing(
      sidebarAnimation,
      {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }
    ).start();
    setDrawerOpen(!drawerOpen);
  };

  const handleNewParticipants = () => {
    console.log("handling new participants");
  };

  return (
    <View style={styles.container}>
      <CustomHeader title={'Groups'} handleSearch={handleSearch} setIsModalVisible={setIsModalVisible}/>
      <View style={styles.body}>
        <SectionList
          sections={sections}
          renderItem={({item}) => <GroupItem group={item} onAnchor={(anchored) => handleAnchor(item, anchored)}/>}
          renderSectionHeader={({section: {title}}) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
        <CreateGroupModal isVisible={isModalVisible} onClose={closeModal} onDraw={toggleDrawer}/>
      </View>
      <Animated.View style={[styles.sideBar, {
        transform: [{
          translateX: sidebarAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [250, 0]
          })
        }]
      }]}>
        <View style={styles.sideBarHeader}>
          <TouchableOpacity onPress={toggleDrawer}>
            <Text style={styles.sideBarTitle}>
              Add Participants
            </Text>
          </TouchableOpacity>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Member Name"
            style={styles.sideBarInput}
          />
        </View>
        <View style={styles.sideBarFooter}>
          <Button style={styles.sideBarBtn} textStyle={styles.sideBarBtnText} text="Cancel" onPress={toggleDrawer}/>
          <Button style={styles.sideBarBtn} textStyle={styles.sideBarBtnText} text="Done"
                  onPress={handleNewParticipants}/>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sideBar: {
    backgroundColor: 'gainsboro',
    width: 250,
    height: '105%',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    justifyContent: "space-between",
    // display: "none",
  },
  sideBarHeader: {
    padding: 10,
    gap: 15,
    alignSelf: "center",
  },
  sideBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
  },
  sideBarInput: {
    width: 200,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  sideBarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 40,
  },
  sideBarFooterButtonRow: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    padding: 10,
  },
  sideBarBtn: {
    backgroundColor: 'transparent',
    padding: 10,
    marginBottom: 16,
  },
  sideBarBtnText: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default GroupScreen;
