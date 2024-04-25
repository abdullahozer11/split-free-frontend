import {StyleSheet, View, SafeAreaView, TouchableOpacity} from 'react-native';
import React from "react";
import {useLocalSearchParams, useNavigation} from "expo-router";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {useExpense} from "@/src/api/expenses";
import {Text, ActivityIndicator} from 'react-native-paper';
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

  const {data: expense, expenseError, expenseLoading} = useExpense(id);
  const {data: payers, payersError, payersLoading} = usePayerList(id);
  const {data: participants, participantsError, participantsLoading} = useParticipantList(id);

  if (expenseLoading || payersLoading || participantsLoading) {
    return <ActivityIndicator/>;
  }

  if (expenseError || payersError || participantsError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

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
            <TouchableOpacity style={styles.backHolder} onPress={() => {
              navigation.goBack();
            }}>
              <Feather name="arrow-left" size={36} color="white"/>
            </TouchableOpacity>
            <Text variant={'displayMedium'} style={styles.headerTitle}>{expense?.title}</Text>
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
    justifyContent: 'center'
  },
  backHolder: {
    position: "absolute",
    left: 10,
  },
  members: {
    marginVertical: 10,
    gap: 10,
  }
});
