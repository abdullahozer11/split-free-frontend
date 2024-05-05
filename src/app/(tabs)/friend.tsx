import {StyleSheet, View} from 'react-native';
import {Text} from '@/src/components/Themed';
import React, {useState} from "react";
import {Feather} from "@expo/vector-icons";
import UnderlinedText from "@/src/components/UnderlinedText";
import {Person} from "@/src/components/Person";
import {ActivityIndicator, ProgressBar} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {useSearchQuery} from "@/src/api/friends";
import {Dropdown} from "react-native-element-dropdown";

export default function FriendScreen() {
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const {data: searchResults, isLoading, isError} = useSearchQuery(searchQuery);

  return (
    <>
      <SafeAreaView style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </SafeAreaView>
      <View style={styles.body}>
        <View style={styles.searchSection}>
          {/*<Dropdown*/}
          {/*  search={true}*/}
          {/*  searchField={'email'}*/}
          {/*  labelField={'email'}*/}
          {/*  valueField={'email'}*/}
          {/*  placeholder={"Search for new friends..."}*/}
          {/*  searchPlaceholder={"Search for friends..."}*/}
          {/*  data={searchResults}*/}
          {/*  onChange={pe => setSelected(pe)}*/}
          {/*  value={null}*/}
          {/*  style={styles.searchBox}*/}
          {/*/>*/}
          {isLoading && <ActivityIndicator/>}
          {isError && <Text>Failed to fetch search results</Text>}
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
