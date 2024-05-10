import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from '@/src/components/Themed';
import React, {useState} from "react";
import {Feather} from "@expo/vector-icons";
import UnderlinedText from "@/src/components/UnderlinedText";
import {Person, SearchProfile} from "@/src/components/Person";
import {ProgressBar, Searchbar} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {supabase} from "@/src/lib/supabase";
import { Menu } from 'react-native-paper';


export default function FriendScreen() {
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    setSearchLoading(true);
    const {data, error} = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', `${searchQuery}%`)
      .limit(10);
    if (error) {
      console.log("error is ", error.message);
      setSearchLoading(false);
      return;
    }
    setSearchResults(data);
    setSearchLoading(false);
  };

  return (
    <>
      <SafeAreaView style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </SafeAreaView>
      <View style={styles.body}>
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            mode={'view'}
            style={{backgroundColor: 'white'}}
            onClearIconPress={() => {setSearchQuery(null)}}
            onIconPress={handleSearch}
            loading={searchLoading}
          />
          <ScrollView style={{backgroundColor: 'white'}}>
            {searchResults?.map((profile) => (
              <View key={profile.id}>
                <SearchProfile onAdd={() => {console.log("searching profile")}} profile={profile} />
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.balanceSection}>
          <View style={{flexDirection: "row", marginHorizontal: 15}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Receivable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold", color: "green"}}>+ €324.00</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Payable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold"}}>- $254.84</Text>
            </View>
          </View>
          <ProgressBar animatedValue={0.7} theme={{colors: {primary: 'green'}}} style={{height: 18, borderRadius: 10}}/>
        </View>
        <View>
          <View style={{flexDirection: "row", gap: 5, alignItems: "center"}}>
            <UnderlinedText text={"All Friends"} fontSize={20} fontWeight={"700"}/>
            <Feather style={{fontSize: 20, fontWeight: "500"}} name={"chevron-down"} size={20}/>
          </View>
          <View style={styles.personContainer}>
            <Person/>
            <Person/>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F6F6F6FF',
    width: "100%",
    height: 130,
    flexDirection: "row",
    padding: 10,
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconContainer: {
    marginLeft: 16,
    borderRadius: 10,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "orange",
  },
  transparent: {
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 40,
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
  searchBox: {
    backgroundColor: "white",
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  searchSection: {
    marginBottom: 20,
  },
});
