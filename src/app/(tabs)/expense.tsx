import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {Text, TextInput, Avatar, ActivityIndicator} from "react-native-paper";
import MyDropdown from "@/src/components/DropdownComponent";
import MyMultiSelect from "@/src/components/MultiSelectComponent";
import {useMemberList} from "@/src/api/members";
import * as ImagePicker from "expo-image-picker";
import {Feather} from "@expo/vector-icons";
import {useNavigation} from "expo-router";
import {useBulkInsertParticipants, useBulkInsertPayers, useInsertExpense} from "@/src/api/expenses";
import DateTimePicker from "@react-native-community/datetimepicker";
import {getFormattedDate} from "@/src/utils/helpers";
import {currencyOptions} from "@/src/constants";
import {Dropdown} from "react-native-element-dropdown";
import {useGroupList} from "@/src/api/groups";

export default function ExpenseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payer, setPayer] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [image, setImage] = useState(null);
  const [currency, setCurrency] = useState("EUR");
  const [amount, setAmount] = useState('0');
  const navigation = useNavigation();
  const [group, setGroup] = useState(null);
  const [inputDate, setInputDate] = useState<Date | undefined>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


  const onDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const date = selectedDate;
      setShowDatePicker(false);
      setInputDate(date);
    } else {
      setShowDatePicker(false);
    }
  };

  const {data: groups} = useGroupList();
  const {data: members, error, isLoading} = useMemberList();
  const {mutate: insertExpense} = useInsertExpense();
  const {mutate: bulkInsertPayers} = useBulkInsertPayers();
  const {mutate: bulkInsertParticipants} = useBulkInsertParticipants();

  const validateData = () => {
    if (!title) {
      console.log('Title is empty');
      Alert.alert('Title is empty');
      return false;
    }

    if (!group) {
      console.log('Pick a group for this expense');
      Alert.alert('Pick a group for this expense');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.log('Amount is not valid');
      Alert.alert('Amount is not valid');
      return false;
    }

    if (!payer) {
      console.log('Add who paid this expense');
      Alert.alert('Add who paid this expense');
      return false;
    }

    if (!participants.length) {
      console.log('Add at least one participant');
      Alert.alert('Add at least one participant');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateData()) {
      return;
    }

    insertExpense({
      title: title,
      description: description,
      date: inputDate,
      amount: amount,
      currency: currency,
      group: group.id,
    }, {
      onSuccess: (data) => {
        console.log("Successfully inserted expense");
        // Formulate payers list
        const payers = [payer];
        const _payers = payers.map(_payer => ({
          member_id: _payer,
          expense_id: data.id,
        }));
        bulkInsertPayers(_payers, {
          onSuccess: () => {
            console.log("Successfully inserted payers");
            // Formulate participants list
            const _participants = participants.map(participant => ({
              member_id: participant,
              expense_id: data.id,
            }));
            bulkInsertParticipants(_participants, {
              onSuccess: () => {
                console.log("Successfully inserted participants");
                // navigation.goBack();
              }
            });
          }
        });

      }
    });
  };

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (error) {
    return <Text>Failed to fetch members</Text>;
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather style={styles.icon} name={"arrow-left"} size={24}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          handleSubmit();
        }}>
          <Text style={styles.icon}>Save</Text>
        </TouchableOpacity>
      </View>
      <Text variant="headlineLarge" style={styles.title}>New Expense</Text>
      <View style={styles.inputs}>
        <View>
          <TextInput
            label="Enter expense title"
            placeholder="Describe your expense"
            value={title}
            onChangeText={setTitle}
            style={{backgroundColor: 'white'}}
          />
        </View>
        <View>
          <TextInput
            label="Enter expense description"
            placeholder="Give additional information"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            style={{backgroundColor: 'white'}}
          />
        </View>
        <Dropdown
          placeholder={'Select group'}
          style={styles.groupDropdown}
          data={groups}
          labelField={'title'}
          valueField={'id'}
          value={'selected'}
          onChange={(gr) => setGroup(gr)}/>
        <View style={{flexDirection: "row", gap: 5}}>
          <TextInput
            label="Enter amount"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{flex: 1, backgroundColor: 'white'}}
          />
          <Dropdown
            placeholder={'Select currency'}
            style={styles.currencyDropdown}
            data={currencyOptions}
            labelField={'label'}
            valueField={'value'}
            value={currency}
            onChange={cu => {
              setCurrency(cu);
            }}/>
          <Pressable
            onPress={() => {
              setShowDatePicker(!showDatePicker);
            }}
            style={styles.datetimeButton}
          >
            <Text variant={"labelMedium"}>{getFormattedDate(inputDate)}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              mode={"date"}
              display={"spinner"}
              value={inputDate}
              onChange={onDateChange}/>
          )}
        </View>
        <View style={{gap: 20}}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
            <Avatar.Image size={48} source={require('@/assets/images/blank-profile.png')}/>
            <MyDropdown selected={payer} data={members} onChange={setPayer} label={"Who paid"}/>
          </View>
          <MyMultiSelect selected={participants} members={members} onChange={setParticipants}/>
          <View style={{
            flexDirection: "row",
            gap: 15,
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 12,
            alignItems: "center"
          }}>
            <Text>Proof of payment: (optional)</Text>
            <Text variant={'labelLarge'} style={{
              borderWidth: 1,
              borderColor: 'maroon',
              borderRadius: 5,
              paddingHorizontal: 5,
              paddingVertical: 3
            }} onPress={pickImage}>Select Image </Text>
            <Avatar.Image style={{display: image ? 1 : "none"}} size={24}
                          source={require('@/assets/images/blank-profile.png')}/>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 10,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    fontWeight: "400",
  },
  datetimeButton: {
    backgroundColor: "white",
    paddingHorizontal: 2,
    borderRadius: 10,
    justifyContent: "center",
  },
  currencyLabel: {
    fontSize: 14,
    color: 'pink',
    marginBottom: 4,
    fontWeight: "500",
  },
  currencyDropdown: {
    backgroundColor: "white",
    color: 'pink',
    padding: 6,
    borderRadius: 6,
    fontSize: 18,
    width: 60,
  },
  inputs: {
    gap: 10,
  },
  title: {
    marginTop: 10,
    marginBottom: 20,
  },
  groupDropdown: {
    backgroundColor: "white",
    padding: 10,
    paddingHorizontal: 15,
  },
});
