import React, {useState} from "react";
import {useNavigation} from "expo-router";
import {useGroupList} from "@/src/api/groups";
import {useMemberList} from "@/src/api/members";
import {
  useBulkInsertParticipants,
  useBulkInsertPayers,
  useInsertExpense,
  useUpdateExpense
} from "@/src/api/expenses";
import {Alert, Pressable, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {getFormattedDate, uploadImage} from "@/src/utils/helpers";
import {ActivityIndicator, Avatar, Text, TextInput} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import {Dropdown} from "react-native-element-dropdown";
import {currencyOptions} from "@/src/constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import MyDropdown from "@/src/components/DropdownComponent";
import MyMultiSelect from "@/src/components/MultiSelectComponent";
import {Feather} from "@expo/vector-icons";

export default function ExpenseForm({title: headerTitle, updatingExpense}) {
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formState, setFormState] = useState(updatingExpense ? {
    ...updatingExpense,
    amount: updatingExpense.amount.toString()
  } : {
    title: '',
    description: '',
    payers: [],
    participants: [],
    image: null,
    currency: 'EUR',
    amount: '0',
    group: null,
    inputDate: new Date(),
  });
  const [modifiedFields, setModifiedFields] = useState({});

  const isUpdating = !!updatingExpense;

  const {mutate: insertExpense} = useInsertExpense();
  const {mutate: updateExpense} = useUpdateExpense();
  const {mutate: bulkInsertPayers} = useBulkInsertPayers();
  const {mutate: bulkInsertParticipants} = useBulkInsertParticipants();
  const {data: groups, error: groupsError, isLoading: groupsLoading} = useGroupList();
  const {data: members, error: membersError, isLoading: membersLoading} = useMemberList();

  if (groupsLoading || membersLoading) {
    return <ActivityIndicator/>;
  }

  if (groupsError || membersError) {
    return <Text>Failed to fetch data</Text>;
  }

  const {title, description, payers, participants, image, currency, amount, group, inputDate} = formState;

  const onDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const date = selectedDate;
      setShowDatePicker(false);
      handleInputChange('inputDate', date);
    } else {
      setShowDatePicker(false);
    }
  };

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

    if (!payers) {
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

  const onSubmit = () => {
    if (!validateData()) {
      console.log('Validation failed');
      return;
    }

    if (isUpdating) {
      onUpdate();
    } else {
      onCreate();
    }
  };

  const onUpdate = async () => {
    const modifiedKeys = Object.keys(modifiedFields);
    let hasAnyFieldModified = modifiedKeys.some(key => ['title', 'description', 'image', 'currency', 'amount', 'group', 'inputDate'].includes(key));
    if (hasAnyFieldModified) {
      updateExpense({
        id: updatingExpense.id,
        title: title,
        description: description,
        image: image,
        currency: currency,
        amount: amount,
        group: group,
        inputDate: inputDate,
      }, {
        onSuccess: () => {
          // console.log('Expense updated');
        }
      });
      // hasAnyFieldModified = modifiedKeys.some(key => ['payers'].includes(key));
      // if (hasAnyFieldModified) {
      //   // bulk delete payers
      //   const payers = payers?.map(payer => ({
      //     member: payer,
      //     expense: updatingExpense.id,
      //   }));
      // }
      // hasAnyFieldModified = modifiedKeys.some(key => ['participants'].includes(key));
      // if (hasAnyFieldModified) {
      //   // Formulate participants list
      //   const participants = participants?.map(participant => ({
      //     member: participant,
      //     expense: updatingExpense.id,
      //   }));
      // }
      navigation.goBack();
    }
  };

  const onCreate = async () => {
    const imagePath = await uploadImage(image);

    insertExpense({
      title: title,
      description: description,
      date: inputDate,
      amount: amount,
      currency: currency,
      group: group.id,
      proof: imagePath,
    }, {
      onSuccess: (data) => {
        // console.log("Successfully inserted expense");
        // Formulate payers list
        const payers = payers?.map(payer => ({
          member: payer,
          expense: data.id,
        }));
        bulkInsertPayers(payers, {
          onSuccess: () => {
            // console.log("Successfully inserted payers");
            // Formulate participants list
            const participants = participants.map(participant => ({
              member: participant,
              expense: data.id,
            }));
            bulkInsertParticipants(participants, {
              onSuccess: () => {
                // console.log("Successfully inserted participants");
                navigation.goBack();
              }
            });
          }
        });
      }
    });
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleInputChange('image', result.assets[0].uri);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setModifiedFields(prevModifiedFields => ({
      ...prevModifiedFields,
      [fieldName]: value !== formState[fieldName],
    }));
    setFormState(prevFormState => ({
      ...prevFormState,
      [fieldName]: value,
    }));
  };

  return (
    <ScrollView style={styles.form}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather style={styles.icon} name={"arrow-left"} size={24}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          onSubmit();
        }}>
          <Text style={styles.icon}>Save</Text>
        </TouchableOpacity>
      </View>
      <Text variant="headlineLarge" style={styles.title}>{headerTitle}</Text>
      <View style={styles.inputs}>
        <View>
          <TextInput
            label="Enter expense title"
            placeholder="Describe your expense"
            value={title}
            onChangeText={(text) => {
              handleInputChange('title', text);
            }}
            style={{backgroundColor: 'white'}}
          />
        </View>
        <View>
          <TextInput
            label="Enter expense description"
            placeholder="Give additional information"
            value={description}
            onChangeText={(text) => {
              handleInputChange('description', text);
            }}
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
          onChange={(gr) => handleInputChange('group', gr)}/>
        <View style={{flexDirection: "row", gap: 5}}>
          <TextInput
            label="Enter amount"
            placeholder="Enter amount"
            value={amount}
            onChangeText={(text) => handleInputChange('amount', text)}
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
              handleInputChange('currency', cu);
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
            <MyDropdown selected={payers[0]} data={members} onChange={(payer) => {
              handleInputChange('payers', [payer]);
            }} label={"Who paid"}/>
          </View>
          <MyMultiSelect selected={participants} members={members}
                         onChange={(participants) => handleInputChange('participants', participants)}/>
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
            {image && <Avatar.Image source={{uri: image}} size={24}/>}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
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
