import {FlatList, View, StyleSheet} from 'react-native';

import {group} from "@/assets/data/group";
import GroupItem from "@/src/components/GroupItem";
import React, {useEffect, useState} from "react";
import {useNavigation, useRouter} from "expo-router";
import {Text} from "@/src/components/Themed";
import CreateGroup from "@/src/modals/CreateGroup";
import CustomHeader from "@/src/components/CustomHeader";

const GroupScreen = ({}) => {
  const navigation = useNavigation();
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => {
    setIsModalVisible(false);
  };

  function handleSearch() {
    console.log('searching');
  }

  const handleAnchor = ({group}) => {
    console.log("group is ", group);
    // group.anchored = !group.anchored;
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <CustomHeader handleSearch={handleSearch} setIsModalVisible={setIsModalVisible}/>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.allGroupsTitle}>All Groups</Text>
      <FlatList
        data={group}
        renderItem={({item}) => <GroupItem group={item} onAnchor={() => {
          handleAnchor(item);
        }}/>}
        keyExtractor={(item) => item.id.toString()}
      />
      <CreateGroup isVisible={isModalVisible} onClose={closeModal}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bigTitle: {
    fontSize: 36,
    fontWeight: '500',
  },
  allGroupsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default GroupScreen;
