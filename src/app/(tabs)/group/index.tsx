import {View, StyleSheet, Alert, ScrollView} from 'react-native';
import GroupItem from "@/src/components/GroupItem";
import React, {useState} from "react";
import CreateGroupModal from "@/src/modals/CreateGroup";
import CustomHeader from "@/src/components/CustomHeader";
import {useGroupList} from "@/src/api/groups";
import {Text, ActivityIndicator, TextInput} from "react-native-paper";
import {useAuth} from "@/src/providers/AuthProvider";
import {useAcceptInvite, useGroupInvitationsForProfile, useRejectInvite} from "@/src/api/profiles";
import {GroupInvite} from "@/src/components/Person";
import {useQueryClient} from "@tanstack/react-query";
import {useGroupSubscriptions} from "@/src/api/groups/subscriptions";

const GroupScreen = ({}) => {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [anchoredGroups, setAnchoredGroups] = useState([]);
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [queryKey, setQueryKey] = useState('');

  const {data: groups, isError: groupsError, isLoading: groupsLoading} = useGroupList();
  const {session} = useAuth();
  const {data: groupInvitations, isError: groupInvitesError, isLoading: groupInvitesLoading} = useGroupInvitationsForProfile(session?.user.id);

  const {mutate: acceptInvite} = useAcceptInvite();
  const {mutate: rejectInvite} = useRejectInvite();

  if (groupsLoading || groupInvitesLoading) {
    return <ActivityIndicator/>;
  }

  if (groupsError || groupInvitesError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  useGroupSubscriptions();

  const toggleSearchBarVisible = () => {
    setSearchBarVisible(!searchBarVisible);
    setQueryKey('');
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleAcceptInvite = ({group_id}) => {
    acceptInvite({
      _profile_id: session?.user.id,
      _group_id: group_id
    }, {
      onSuccess: async () => {
        // console.log('Accept invite command handled successfully')
        await queryClient.invalidateQueries(['groups']);
        await queryClient.invalidateQueries(['group_invites_for_profile']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    })
  };

  const handleRejectInvite = ({id: invite_id}) => {
    rejectInvite(invite_id, {
      onSuccess: async () => {
        console.log('Reject invite command handled successfully')
        await queryClient.invalidateQueries(['group_invites_for_profile']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    })
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
        style={{marginHorizontal: 10}}
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
                <Text variant={"headlineLarge"}>Other Groups</Text>
                {section.data.map((item) => <GroupItem key={item.id} group={item} onAnchor={(anchored) => handleAnchor(item, anchored)}/>)}
              </View>
            );
          }
        })}
        <CreateGroupModal isVisible={isModalVisible} onClose={closeModal}/>
        <View style={{flex: 1}}>
          {groupInvitations.length != 0 && <Text variant={'titleLarge'}>Group Invites</Text>}
          {groupInvitations?.map((gi) => (
            <GroupInvite key={gi.id} invite={gi}
                         onAccept={() => {handleAcceptInvite(gi)}}
                         onReject={() => {handleRejectInvite(gi)}}
            />
          ))}
        </View>
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
