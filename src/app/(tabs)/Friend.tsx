import {StyleSheet} from 'react-native';

import {Text, View} from '@/src/components/Themed';
import React, {useEffect, useState} from "react";
import CustomHeader from "@/src/components/CustomHeader";
import {useNavigation} from "expo-router";

export default function FriendScreen() {
  const navigation = useNavigation();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSearch = () => {
    console.log('searching');
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
      <Text style={styles.title}>Friends Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
