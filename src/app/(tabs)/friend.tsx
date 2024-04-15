import {StyleSheet, View} from 'react-native';
import {Text} from '@/src/components/Themed';
import React, {useState} from "react";
import CustomHeader from "@/src/components/CustomHeader";
import {SafeAreaView} from "react-native-safe-area-context";

export default function FriendScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSearch = () => {
    console.log('searching');
  };

  return (
    <View>
      <CustomHeader title={'Friends'} handleSearch={handleSearch} setIsModalVisible={setIsModalVisible}/>
      <View style={styles.body}>
        <Text style={styles.title}>Friends Screen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    borderWidth: 1,
    borderColor: "orange",
    backgroundColor: 'white',
  },
  body: {
    padding: 16,
  },
});
