import {FlatList, Pressable, View, StyleSheet} from 'react-native';

import {group} from "@/assets/data/group";
import GroupItem from "@/src/components/GroupItem";
import React, {useEffect, useState} from "react";
import {useNavigation, useRouter} from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {Text} from "@/src/components/Themed";
import CreateGroup from "@/src/modals/CreateGroup";

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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={[styles.iconsContainer, styles.transparent]}>
          <Pressable onPress={handleSearch} style={[styles.iconContainer, {backgroundColor: "white"}]}>
            <FontAwesome size={24} name={'search'}/>
          </Pressable>
          <Pressable onPress={() => {
            setIsModalVisible(true);
          }} style={styles.iconContainer}>
            <FontAwesome size={24} name={'plus'}/>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.allGroupsTitle}>All Groups</Text>
      <FlatList
        data={group}
        renderItem={({item}) => <GroupItem group={item}/>}
        keyExtractor={(item) => item.id.toString()}
      />
      <CreateGroup isVisible={isModalVisible} onClose={closeModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  transparent: {
    backgroundColor: "transparent",
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
  iconsContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconContainer: {
    marginLeft: 16,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    backgroundColor: "orange",
  },
});

export default GroupScreen;
