import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import React from "react";
import {Feather} from "@expo/vector-icons";
import {useGroup} from "@/src/api/groups";
import {useLocalSearchParams, useNavigation} from "expo-router";
import ExpenseItem from "@/src/components/ExpenseItem";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {Hidden, groupElementsByDay} from "@/src/utils/helpers";
import {Menu, ActivityIndicator} from 'react-native-paper';
import {useExpenseList} from "@/src/api/expenses";

const GroupDetailsScreen = () => {
  const {id: idString} = useLocalSearchParams();
  const id = parseFloat(typeof idString === 'string' ? idString : idString[0]);
  const navigation = useNavigation();
  const {data: group, error: groupError, isLoading: groupLoading} = useGroup(id);
  const {data: expenses, error: expenseError, isLoading: expenseLoading} = useExpenseList(id);
  // menu related
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  if (groupLoading || expenseLoading) {
    return <ActivityIndicator/>;
  }

  if (groupError || expenseError) {
    return <Text>Failed to fetch group</Text>;
  }

  const groupedExpenses = groupElementsByDay(expenses);

  const handleStats = () => {
    console.log('stats');
  };

  return (
    <View style={styles.container}>
      <CollapsableHeader H_MIN_HEIGHT={120} H_MAX_HEIGHT={240} content={
        <View style={styles.content}>
          <Hidden>First Section</Hidden>
          <View style={{padding: 20, flex: 1}}>
            <View style={{flexDirection: "row", marginHorizontal: 15, paddingBottom: 60}}>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18}}>Group spent:</Text>
                <Text style={{fontSize: 24, fontWeight: "bold"}}>$934.00</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18}}>Total Receivable:</Text>
                <Text style={{fontSize: 24, fontWeight: "bold", color: "green"}}>+ $324.00</Text>
              </View>
            </View>
            <Hidden>Second Section</Hidden>
            <View style={{}}>
              {Object.keys(groupedExpenses).map((item) => (
                <View style={styles.activityGroup} key={item}>
                  <Text style={styles.date}>{item}</Text>
                  {groupedExpenses[item].map((expense) => (
                    <ExpenseItem key={expense.id} expense={expense}/>
                  ))}
                </View>
              ))}
            </View>

          </View>
        </View>
      } headerContent={
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => {
              navigation.goBack();
            }}>
              <Feather name="arrow-left" size={36} color="gold"/>
            </TouchableOpacity>
            <View style={{flexDirection: "row", gap: 10}}>
              <TouchableOpacity onPress={handleStats}>
                <Feather name="pie-chart" size={36} color="gold"/>
              </TouchableOpacity>
              <Menu
                visible={visible}
                onDismiss={closeMenu}
                contentStyle={{backgroundColor: "white"}}
                anchor={
                  <TouchableOpacity onPress={openMenu}>
                    <Feather name="more-horizontal" size={36} color="gold"/>
                  </TouchableOpacity>
                }>
                <Menu.Item onPress={() => {
                  console.log("Edit Group");
                  closeMenu();
                }} title="Edit Group"/>
                <Menu.Item onPress={() => {
                  console.log("Delete group");
                  closeMenu();
                }} title="Delete Group"
                           titleStyle={{color: "red"}}
                />
              </Menu>
            </View>
          </View>
          <View/>
          <Text style={styles.headerTitle}>{group.title}</Text>
          <Text style={styles.syncInfo}>Last Sync On January 21, 2024</Text>
        </View>
      }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#F6F6F6FF",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    gap: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  syncInfo: {
    fontSize: 12,
    fontWeight: "300",
    color: "white",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 50,
    paddingHorizontal: 20,
    position: "absolute",
    top: 20,
    left: 0,
    backgroundColor: "transparent",
  },
  activityGroup: {
    marginTop: 10,
    gap: 10,
  },
  date: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default GroupDetailsScreen;
