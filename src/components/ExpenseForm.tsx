import React, {useState} from "react";
import {useNavigation} from "expo-router";
import {useMemberList} from "@/src/api/members";
import {
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


function formatDateForPostgreSQL(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function ExpenseForm({title: headerTitle, groupId, updatingExpense}) {
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formState, setFormState] = useState(updatingExpense ? {
    ...updatingExpense,
    amount: updatingExpense.amount.toString(),
    inputDate: new Date(updatingExpense.date)

  } : {
    title: '',
    description: '',
    payers: [],
    participants: [],
    image: null,
    currency: 'EUR',
    amount: '0',
    group_id: groupId,
    inputDate: new Date(),
  });

  const isUpdating = !!updatingExpense;

  const {mutate: insertExpense} = useInsertExpense();
  const {mutate: updateExpense} = useUpdateExpense();
  const {data: members, error: membersError, isLoading: membersLoading} = useMemberList(groupId);

  if (membersLoading) {
    return <ActivityIndicator/>;
  }

  if (membersError) {
    console.log(membersError);
    return <Text>Failed to fetch data</Text>;
  }

  console.log("rendering form");

  const {title, description, payers, participants, image, currency, amount, group_id, inputDate} = formState;

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

  const onSubmit = async () => {
    if (!validateData()) {
      console.log('Validation failed');
      return;
    }

    if (isUpdating) {
      await onUpdate();
    } else {
      await onCreate();
    }
  };

  const onUpdate = async () => {
    console.log("Updating expense")
    console.log(groupId, "//", title,"//", description,"//", currency,"//", amount,"//", inputDate,"//", payers,"//", participants)
    // const imagePath = await uploadImage(image);
    updateExpense({
      id: updatingExpense.id,
      amount: amount,
      currency: currency,
      date: formatDateForPostgreSQL(inputDate),
      description: description,
      participants: participants,
      payers: payers,
      proof: null,
      title: title
    }, {
      onSuccess: () => {
        console.log('Successfully updated expense');
      }
    });
    navigation.goBack();
  };

  const onCreate = async () => {
    console.log("Creating expense")
    // console.log(groupId, "//", title,"//", description,"//", currency,"//", amount,"//", inputDate,"//", payers,"//", participants)
    // const imagePath = await uploadImage(image);
    insertExpense({
      group_id: groupId,
      title: title,
      description: description ? description : null,
      currency: currency,
      amount: amount,
      date: formatDateForPostgreSQL(inputDate),
      proof: null,
      payers: payers,
      participants: participants
    }, {
      onSuccess: () => {
        console.log("Successfully inserted expense");
      }
    });
    navigation.goBack();
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
            onEndEditing={(text) => {
              handleInputChange('title', text);
            }}
            style={{backgroundColor: 'white'}}
          />
        </View>
        <View>
          <TextInput
            label="Enter expense description (optional)"
            placeholder="Give additional information"
            value={description}
            onEndEditing={(text) => {
              handleInputChange('description', text);
            }}
            multiline={true}
            style={{backgroundColor: 'white'}}
          />
        </View>
        <View style={{flexDirection: "row", gap: 5}}>
          <TextInput
            label="Enter amount"
            placeholder="Enter amount"
            value={amount}
            onEndEditing={(text) => handleInputChange('amount', text)}
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
            <MyDropdown
              labelField="name"
              valueField="id"
              data={members}
              onChange={(payer) => {
                handleInputChange('payers', [payer]);
              }}
              label={"Who paid"}
              selected={payers[0]}
            />
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
