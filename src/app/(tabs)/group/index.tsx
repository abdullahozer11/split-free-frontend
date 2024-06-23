import {View, StyleSheet, ScrollView} from 'react-native';
import GroupItem from "@/src/components/GroupItem";
import React, {useState} from "react";
import CreateGroupModal from "@/src/modals/CreateGroup";
import CustomHeader from "@/src/components/CustomHeader";
import {useGroupList} from "@/src/api/groups";
import {Text, ActivityIndicator, TextInput} from "react-native-paper";
import {useGroupInviteSubscriptions, useGroupSubscriptions} from "@/src/api/groups/subscriptions";
import {useAuth} from "@/src/providers/AuthProvider";

const GroupScreen = ({}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [anchoredGroups, setAnchoredGroups] = useState([]);
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [queryKey, setQueryKey] = useState('');
  const {data: groups, isError: groupsError, isLoading: groupsLoading} = useGroupList();

  const {session} = useAuth();
  useGroupSubscriptions();
  useGroupInviteSubscriptions(session?.user.id);

  if (groupsLoading) {
    return <ActivityIndicator/>;
  }

  if (groupsError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  const toggleSearchBarVisible = () => {
    setSearchBarVisible(!searchBarVisible);
    setQueryKey('');
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleAnchor = (group, anchored) => {
    group.anchored = anchored;
    // Update anchored groups state
    if (anchored) {
      setAnchoredGroups([...anchoredGroups, group]);
    } else {
      setAnchoredGroups(anchoredGroups.filter(g => g.id !== group.id));
    }
  };

  // Filter groups based on queryKey
  const filteredGroups = groups?.filter(group =>
    group.title.toLowerCase().includes(queryKey.toLowerCase())
  );

  // Define sections for SectionList
  const sections = [];
  if (anchoredGroups.length > 0) {
    sections.push({title: "Quick Access", data: anchoredGroups});
  }
  sections.push({title: anchoredGroups.length > 0 ? "Other Groups" : "All Groups", data: filteredGroups.filter(g => !anchoredGroups.some(ag => ag.id === g.id))});

  return (
    <View style={styles.container}>
      <CustomHeader title={'Groups'} handleSearch={toggleSearchBarVisible} setIsModalVisible={setIsModalVisible}/>
      {searchBarVisible && <TextInput
        placeholder={''}
        onChangeText={setQueryKey}
        value={queryKey}
        style={{backgroundColor: 'white',marginHorizontal: 10}}
        right={<TextInput.Icon
          icon={"close"}
          onPress={toggleSearchBarVisible}
        />}
      />}
      <ScrollView style={styles.body}>
        {sections.map((section) => {
          if (section.title === 'Quick Access') {
            return (
              <View key={section.title}>
                <Text variant={"headlineLarge"}>Quick Access</Text>
                {section.data.map((item) => <GroupItem key={item.id} group={item} onAnchor={(anchored) => handleAnchor(item, anchored)}/>)}
              </View>
            );
          } else {
            return (
              <View key={section.title}>
                <Text variant={"headlineLarge"}>{section.title}</Text>
                {section.data.map((item) => <GroupItem key={item.id} group={item} onAnchor={(anchored) => handleAnchor(item, anchored)}/>)}
              </View>
            );
          }
        })}
        <CreateGroupModal isVisible={isModalVisible} onClose={closeModal}/>
      </ScrollView>
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
    flex: 1,
  },
});

export default GroupScreen;
