import {StyleSheet, View, SafeAreaView, TouchableOpacity, Alert} from 'react-native';
import React, {useEffect, useState} from "react";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {useDeleteExpense, useExpense, useSettleExpense} from "@/src/api/expenses";
import {Text, ActivityIndicator, Menu, Portal, Dialog, Button} from 'react-native-paper';
import {Feather} from "@expo/vector-icons";
import {Participant, Payer} from "@/src/components/Person";
import {useQueryClient} from "@tanstack/react-query";
import {formatDateString} from "@/src/utils/helpers";


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
  const id = parseInt(typeof expenseIdString === 'string' ? expenseIdString : expenseIdString[0]);
  const group_id = parseInt(typeof groupIdString === 'string' ? groupIdString : groupIdString[0]);
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();

  // menu related
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [amountPerParticipant, setAmountPerParticipant] = useState(0);

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const {data: expense, isError: isExpenseError, isLoading: expenseLoading} = useExpense(id);

  const {mutate: deleteExpense} = useDeleteExpense();
  const {mutate: settleExpense} = useSettleExpense();

  useEffect(() => {
    setAmountPerParticipant(((expense?.amount ?? 0) / (expense?.participants?.length)).toFixed(2));
  }, [expense]);

  if (expenseLoading) {
    return <ActivityIndicator/>;
  }

  if (isExpenseError) {
    console.log('isExpenseError is:', isExpenseError);
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  const promptDelete = () => {
    setIsDialogVisible(true);
  };

  // console.log('last modified date is ', formatDateString(expense.last_modified));

  const handleDelete = () => {
    console.log("deleting expense");
    deleteExpense(expense?.id, {
      onSuccess: async () => {
        // console.log("Successfully deleted expense: ", expense.id);
        navigation.goBack();
        await queryClient.invalidateQueries(['group', group_id]);
        await queryClient.invalidateQueries(['expenses', group_id]);
        await queryClient.invalidateQueries(['groups']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  const handleSettle = () => {
    settleExpense({
      id: expense?.id,
      group_id: expense?.group_id,
      settled: true,
    })
  };

  console.log('expense settled is ', expense?.settled);

  return (
    <SafeAreaView style={styles.container}>
      <CollapsableHeader H_MAX_HEIGHT={200} H_MIN_HEIGHT={52} content={
        <View style={styles.content}>
          <Text variant={"headlineLarge"}>Expense</Text>
          {expense?.description && <Description text={expense?.description}/>}
          <View style={styles.section}>
            <Text variant={'titleSmall'}>Who paid?</Text>
            <View style={styles.members}>
              {expense?.payers?.map(payer => (
                <Payer key={payer.id} payer={payer} amount={expense?.amount?.toFixed(2)}/>)
              )}
            </View>
          </View>
          <View style={styles.section}>
            <Text variant={'titleSmall'}>Who shared?</Text>
            <View style={styles.members}>
              {expense?.participants?.map(participant => (
                  <Participant key={participant.id} participant={participant}
                               amount={amountPerParticipant}/>
                )
              )}
            </View>
          </View>
          {expense?.settled ? <Text style={styles.settledText}>Settled</Text> : <TouchableOpacity onPress={handleSettle}>
            <Text style={styles.settleButton}>Mark as settled</Text>
          </TouchableOpacity>}
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
              contentStyle={{marginTop: 40, backgroundColor: "white"}}
              anchor={
                <TouchableOpacity onPress={openMenu}>
                  <Feather name="more-horizontal" size={36} color="white"/>
                </TouchableOpacity>
              }>
              {!expense?.settled && <Menu.Item onPress={handleSettle} title="Set settled"
                          titleStyle={{color: "green"}}
              />}
              {!expense?.settled && <Menu.Item onPress={() => {
                closeMenu();
                router.push({pathname: "/(tabs)/group/[group_id]/expense/[expense_id]/update", params: {group_id: group_id, expense_id: id}});
              }} title="Edit expense"/>}
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
            <Text style={styles.syncInfo}>Last modified on {expense && formatDateString(expense.last_modified)}</Text>
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
  section: {
    marginTop: 10,
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
  settleButton: {
    marginTop: 10,
    width: '100%',
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: "center",
    color: "green",
    fontSize: 20,
  },
  settledText: {
    marginTop: 10,
    width: '100%',
    textAlign: "center",
    color: "green",
    fontSize: 26,
  },
});
