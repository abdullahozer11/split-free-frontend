import {StyleSheet, View, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {useState} from "react";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {useDeleteExpense, useExpense} from "@/src/api/expenses";
import {Text, ActivityIndicator, Menu, Portal, Dialog, Button} from 'react-native-paper';
import {Feather} from "@expo/vector-icons";
import {Participant, Payer} from "@/src/components/Person";

const Description = ({text}) => {
  return (
    <View style={{backgroundColor: 'white', padding: 10, borderRadius: 10, marginVertical: 10}}>
      <Text variant={'labelLarge'} style={{textDecorationLine: 'underline'}}>Description</Text>
      <Text variant={'bodyLarge'}>{text}</Text>
    </View>
  );
};

const ExpenseDetailsScreen = () => {
  const {group_id: groupIdString, expense_id: expenseIdString} = useLocalSearchParams();
  const id = parseFloat(typeof expenseIdString === 'string' ? expenseIdString : expenseIdString[0]);
  const group_id = parseFloat(typeof groupIdString === 'string' ? groupIdString : groupIdString[0]);
  const navigation = useNavigation();
  const router = useRouter();

  // menu related
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const {data: expense, expenseError, expenseLoading} = useExpense(id);

  const {mutate: deleteExpense} = useDeleteExpense();

  if (expenseLoading) {
    return <ActivityIndicator/>;
  }

  if (expenseError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  const promptDelete = () => {
    setIsDialogVisible(true);
  };

  const handleDelete = () => {
    console.log("deleting expense");
    deleteExpense(expense?.id, {
      onSuccess: () => {
        console.log("Successfully deleted expense");
      }
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CollapsableHeader H_MAX_HEIGHT={200} H_MIN_HEIGHT={52} content={
        <View style={styles.content}>
          <Text variant={"headlineLarge"}>Expense</Text>

          {expense?.description && <Description text={expense?.description}/>}

          <Text variant={'titleSmall'}>Who paid?</Text>
          <View style={styles.members}>
            {expense?.payers?.map(payer => (
              <Payer key={payer.id} payer={payer} amount={expense?.amount}/>)
            )}
          </View>
          <Text variant={'titleSmall'}>Who shared?</Text>
          <View style={styles.members}>
            {expense?.participants?.map(participant => (
                <Participant key={participant.id} participant={participant}
                             amount={expense?.amount / expense?.participants?.length | 0}/>
              )
            )}
          </View>
        </View>
      } headerContent={
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => {
              navigation.goBack();
            }}>
              <Feather name="arrow-left" size={36} color="white"/>
            </TouchableOpacity>
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              contentStyle={{backgroundColor: "white"}}
              anchor={
                <TouchableOpacity onPress={openMenu}>
                  <Feather name="more-horizontal" size={36} color="white"/>
                </TouchableOpacity>
              }>
              <Menu.Item onPress={() => {
                closeMenu();
                router.push({pathname: "/(tabs)/group/[group_id]/expense/[expense_id]/update", params: {group_id: group_id, expense_id: id}});
              }} title="Edit expense"/>
              <Menu.Item onPress={() => {
                promptDelete();
                closeMenu();
              }} title="Delete expense"
                         titleStyle={{color: "red"}}
              />
            </Menu>
          </View>
          <View style={styles.headerContent}>
            <Text variant={'displaySmall'} style={styles.headerTitle}>{expense?.title}</Text>
            <Text style={styles.syncInfo}>Last modified on January 21, 2024</Text>
          </View>
        </View>
      }/>
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => {
          setIsDialogVisible(false);
        }}>
          <Dialog.Icon icon="alert"/>
          <Dialog.Title>Are you sure to delete this expense?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default ExpenseDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    marginBottom: 10,
    maxWidth: "70%",
  },
  syncInfo: {
    fontSize: 12,
    fontWeight: "300",
    color: "white",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  members: {
    marginVertical: 10,
    gap: 10,
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
  headerContent: {
    justifyContent: "space-between",
    alignItems: "center",
  },
});
