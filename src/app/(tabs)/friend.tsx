import {StyleSheet, View} from 'react-native';
import {Text} from '@/src/components/Themed';
import React, {useState} from "react";
import CustomHeader from "@/src/components/CustomHeader";
import {Feather} from "@expo/vector-icons";
import UnderlinedText from "@/src/components/UnderlinedText";
import {Person} from "@/src/components/Person";
import {ProgressBar} from "react-native-paper";

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
          <ProgressBar animatedValue={0.7} theme={{ colors: { primary: 'green' } }} style={{height: 18, borderRadius: 10}} />
        </View>
        <View>
          <View style={{flexDirection: "row", gap: 5, alignItems: "center"}}>
            <UnderlinedText text={"All Friends"} fontSize={20} fontWeight={"700"} />
            <Feather style={{fontSize: 20, fontWeight: "500"}} name={"chevron-down"} size={20} />
          </View>
          <View style={styles.personContainer}>
            <Person />
            <Person />
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
  personContainer: {
    gap: 10,
    padding: 10,
  },
});
