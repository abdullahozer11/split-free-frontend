import {StyleSheet, View, TouchableOpacity, Pressable} from 'react-native';
import React, {useState} from "react";
import {Feather} from "@expo/vector-icons";
import {useDeleteGroup, useGroup} from "@/src/api/groups";
import {Link, useLocalSearchParams, useNavigation} from "expo-router";
import ExpenseItem from "@/src/components/ExpenseItem";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {Hidden, groupElementsByDay} from "@/src/utils/helpers";
import {Menu, Text, ActivityIndicator, Dialog, Button, Portal} from 'react-native-paper';
import {useExpenseList} from "@/src/api/expenses";
import {Member} from "@/src/components/Person";


const GroupDetailsScreen = () => {
  const {group_id: idString} = useLocalSearchParams();
  const id = parseFloat(typeof idString === 'string' ? idString : idString[0]);
  const navigation = useNavigation();

  const {data: group, error: groupError, isLoading: groupLoading} = useGroup(id);
  const {data: expenses, error: expenseError, isLoading: expenseLoading} = useExpenseList(id);

  const {mutate: deleteGroup} = useDeleteGroup();

  // menu related
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  if (groupLoading || expenseLoading) {
    return <ActivityIndicator/>;
  }

  if (groupError || expenseError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  const groupedExpenses = groupElementsByDay(expenses);

  const handleStats = () => {
    console.log('stats');
  };

  const promptDelete = () => {
    setIsDialogVisible(true);
  };

  const handleDelete = () => {
    console.log("deleting group");
    deleteGroup(group.id, {
      onSuccess: () => {
        console.log("Successfully deleted group with id ", group.id);
      }
    });
    navigation.goBack();
  };

  const promptInvite = () => {
    console.log('invite');
  };

  return (
    <View style={styles.container}>
      <CollapsableHeader H_MIN_HEIGHT={120} H_MAX_HEIGHT={240} content={
        <View style={styles.content}>
          <Hidden>First Section</Hidden>
          <View style={{padding: 20, flex: 1}}>
            <View style={{flexDirection: "row", marginHorizontal: 15, paddingBottom: 30}}>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18}}>Group spent:</Text>
                <Text style={{fontSize: 24, fontWeight: "bold"}}>€{group?.expense_total || 0}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18}}>Total Receivable:</Text>
                <Text style={{fontSize: 24, fontWeight: "bold", color: "green"}}>+ $324.00</Text>
              </View>
            </View>
            <View style={styles.section}>
              <View>
                {Object.keys(groupedExpenses).map((item) => (
                  <View style={styles.activityGroup} key={item}>
                    <Text variant={'titleMedium'}>{item}</Text>
                    {groupedExpenses[item].map((expense) => (
                      <ExpenseItem key={expense.id} expense={expense}/>
                    ))}
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Text variant={'titleMedium'}>Members</Text>
              {group?.members && group?.members?.map(member => (
                  <Member key={member.name} member={member}/>
                )
              )}
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
                  promptDelete();
                  closeMenu();
                }} title="Delete Group"
                           titleStyle={{color: "red"}}
                />
                <Menu.Item onPress={() => {
                  promptInvite();
                }} title="Invite a person"
                           titleStyle={{color: "blue"}}
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
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => {
          setIsDialogVisible(false);
        }}>
          <Dialog.Icon icon="alert"/>
          <Dialog.Title>Are you sure to delete this group?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Link href={`/(tabs)/group/${id}/expense/create`} asChild>
        <Pressable style={styles.newExpenseBtn}>
          <Feather name={"plus"} size={36}/>
          <Text variant={'titleMedium'}>Expense</Text>
        </Pressable>
      </Link>
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
  section: {
    marginBottom: 10,
    gap: 10
  },
  newExpenseBtn: {
    position: "absolute",
    bottom: 20,
    right: 15,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderStyle: "dashed",
  },
});

export default GroupDetailsScreen;
