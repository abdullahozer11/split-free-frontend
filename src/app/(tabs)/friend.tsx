import {StyleSheet, View} from 'react-native';
import {Text} from '@/src/components/Themed';
import React, {useState} from "react";
import CustomHeader from "@/src/components/CustomHeader";
import LineGraph from "@/src/components/LineGraph";
import {Feather} from "@expo/vector-icons";

export default function FriendScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSearch = () => {
    console.log('searching');
  };

  return (
    <>
      <CustomHeader title={'Friends'} handleSearch={handleSearch} setIsModalVisible={setIsModalVisible}/>
      <View style={styles.body}>
        <View style={styles.balanceSection}>
          <View style={{flexDirection: "row", marginHorizontal: 15}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Receivable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold", color: "green"}}>+ $324.00</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Payable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold"}}>- $254.84</Text>
            </View>
          </View>
          <LineGraph leftPercentage={0.7}/>
        </View>
        <View>
          <View style={{flexDirection: "row", gap: 5}}>
            <Text>All Friends</Text>
            <Feather name={"arrow-down"} size={24} />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    borderWidth: 1,
    borderColor: "orange",
    backgroundColor: 'white',
  },
  body: {
    padding: 16,
    backgroundColor: '#F6F6F6FF',
    flex: 1,
  },
  balanceSection: {
    marginBottom: 30,
    gap: 15,
  },
});
