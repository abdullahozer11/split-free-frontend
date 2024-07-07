import {View, SafeAreaView, TouchableOpacity, Alert, Pressable} from 'react-native';
import React, {useEffect, useState} from "react";
import {Link, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {useDeleteExpense, useExpense, useSettleExpense} from "@/src/api/expenses";
import {Text, ActivityIndicator, Menu, Portal, Dialog, Button} from 'react-native-paper';
import {Feather} from "@expo/vector-icons";
import {Participant, Payer} from "@/src/components/Person";
import {useQueryClient} from "@tanstack/react-query";
import {formatDateString} from "@/src/utils/helpers";


const Description = ({text}) => {
  return (
    <View className='bg-white rounded-[10px] p-4'>
      <Text variant={'labelLarge'} className='underline'>Description</Text>
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
  const [isDialog2Visible, setIsDialog2Visible] = useState(false);

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
    }, {
      onSuccess: async () => {
        setIsDialog2Visible(false);
        await queryClient.invalidateQueries(['groups']);
        await queryClient.invalidateQueries(['debts']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
        setIsDialog2Visible(false);
      },
    })
  };

  return (
    <SafeAreaView className='flex-1'>
      <CollapsableHeader H_MAX_HEIGHT={200} H_MIN_HEIGHT={52} content={
        <View className='flex-1 p-5'>
          <Text variant={"headlineLarge"}>Expense</Text>
          {expense?.description && <Description text={expense?.description}/>}
          <View className='mt-2'>
            <Text variant={'titleSmall'}>Who paid?</Text>
            <View style={{gap: 10}} className='my-2'>
              {expense?.payers?.map(payer => (
                <Payer key={payer.id} payer={payer} amount={expense?.amount?.toFixed(2)}/>)
              )}
            </View>
          </View>
          <View className='mt-2'>
            <Text variant={'titleSmall'}>Who shared?</Text>
            <View style={{gap: 10}} className='my-2'>
              {expense?.participants?.map(participant => (
                  <Participant key={participant.id} participant={participant}
                               amount={amountPerParticipant}/>
                )
              )}
            </View>
          </View>
          {!expense?.settled &&
          <Link href={`/(tabs)/group/${group_id}/expense/${id}/update`} asChild>
            <Pressable>
              <Text className='mt-2 w-full border-blue-500 text-blue-500 border-[1px] rounded-[20px] p-2 text-center text-xl'>Edit expense</Text>
            </Pressable>
          </Link>
          }
          {expense?.settled ? <Text className='mt-4 w-full text-center text-green-600 text-4xl'>Settled</Text> : <TouchableOpacity onPress={() => setIsDialog2Visible(true)}>
            <Text className='mt-2 w-full border-green-500 text-green-500 border-[1px] rounded-[20px] p-2 text-center text-xl'>Mark as settled</Text>
          </TouchableOpacity>}
        </View>
      } headerContent={
        <View className='justify-center items-center flex-1'>
          <View className='flex-row justify-between items-center w-full h-[50px] px-5 absolute top-5 left-0 bg-transparent'>
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
              {!expense?.settled && <Menu.Item onPress={() => setIsDialog2Visible(true)} title="Set settled"
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
          <View className='justify-between items-center'>
            <Text variant={'displaySmall'} className='text-white mb-2 max-w-[70%]'>{expense?.title}</Text>
            <Text className='text-sm font-200 text-white'>Last modified on {expense && formatDateString(expense.last_modified)}</Text>
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
        <Dialog visible={isDialog2Visible} onDismiss={() => {
          setIsDialog2Visible(false);
        }}>
          <Dialog.Icon icon="alert"/>
          <Dialog.Title>Are you sure to settle this expense?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialog2Visible(false)}>Cancel</Button>
            <Button onPress={handleSettle}>Settle</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default ExpenseDetailsScreen;