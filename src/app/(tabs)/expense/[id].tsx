import {StyleSheet, View, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {useState} from "react";
import {useLocalSearchParams, useNavigation} from "expo-router";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {useExpense} from "@/src/api/expenses";
import {Text, ActivityIndicator, Menu} from 'react-native-paper';
import {Feather} from "@expo/vector-icons";
import {useParticipantList, usePayerList} from "@/src/api/members";
import {Participant, Payer} from "@/src/components/Person";

const Description = ({text}) => {
  return (
    <View style={{backgroundColor: 'white', padding: 10, borderRadius: 10, marginVertical: 10}}>
      <Text variant={'labelMedium'} style={{textDecorationLine: 'underline'}}>Description</Text>
      <Text variant={'bodyMedium'}>{text}</Text>
    </View>
  );
};

const ExpenseDetailsScreen = () => {
  const {id: idString} = useLocalSearchParams();
  const id = parseFloat(typeof idString === 'string' ? idString : idString[0]);
  const navigation = useNavigation();

  // menu related
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {data: expense, expenseError, expenseLoading} = useExpense(id);
  const {data: payers, payersError, payersLoading} = usePayerList(id);
  const {data: participants, participantsError, participantsLoading} = useParticipantList(id);

  if (expenseLoading || payersLoading || participantsLoading) {
    return <ActivityIndicator/>;
  }

  if (expenseError || payersError || participantsError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  const promptDelete = () => {
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CollapsableHeader H_MAX_HEIGHT={200} H_MIN_HEIGHT={52} content={
        <View style={styles.content}>
          <Text variant={"headlineLarge"}>Expense</Text>

          {expense?.description && <Description text={expense?.description}/>}

          <Text variant={'titleSmall'}>Who paid?</Text>
          <View style={styles.members}>
            {payers?.map(payer => (
              <Payer key={payer.id} payer={payer}/>)
            )}
          </View>
          <Text variant={'titleSmall'}>Who shared?</Text>
          <View style={styles.members}>
            {participants?.map(participant => (
              <Participant key={participant.id} participant={participant}/>)
            )}
          </View>
        </View>
      } headerContent={
        <View style={styles.header}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => {
              navigation.goBack();
            }}>
              <Feather name="arrow-left" size={36} color="white"/>
            </TouchableOpacity>
            <Text variant={'displayMedium'} style={styles.headerTitle}>{expense?.title}</Text>
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
                  console.log("Edit expense");
                  closeMenu();
                }} title="Edit expense"/>
                <Menu.Item onPress={() => {
                  console.log("Delete expense");
                  promptDelete();
                  closeMenu();
                }} title="Delete expense"
                           titleStyle={{color: "red"}}
                />
              </Menu>
          </View>
          <Text style={styles.syncInfo}>Last modified on January 21, 2024</Text>
        </View>
      }/>
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
  }
});
