import React, {useState} from "react";
import {useNavigation} from "expo-router";
import {useMemberList} from "@/src/api/members";
import {
  useInsertExpense,
  useUpdateExpense
} from "@/src/api/expenses";
import {Alert, Pressable, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {getFormattedDate, uploadImage, formatDate} from "@/src/utils/helpers";
import {ActivityIndicator, Avatar, Button, Text, TextInput, Tooltip} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import {Dropdown} from "react-native-element-dropdown";
import {currencyOptions} from "@/src/constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import MyDropdown from "@/src/components/DropdownComponent";
import MyMultiSelect from "@/src/components/MultiSelectComponent";
import {Feather, FontAwesome6, MaterialIcons} from "@expo/vector-icons";
import {useQueryClient} from "@tanstack/react-query";
import {exp_cats} from "@/src/utils/expense_categories";
import {supabase} from "@/src/lib/supabase.ts";


const renderCatItem = item => {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{item.name}</Text>
      <MaterialIcons size={24} name={item.icon}/>
    </View>
  );
};


export default function ExpenseForm({title: headerTitle, groupId, updatingExpense}) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isLoading, setLoading] = useState();

  const [formState, setFormState] = useState(updatingExpense ? {
    ...updatingExpense,
    id: updatingExpense.id,
    amount: updatingExpense.amount.toString(),
    payers: updatingExpense.payer_ids,
    participants: updatingExpense.participant_ids,
    inputDate: new Date(updatingExpense.date)
  } : {
    title: '',
    description: '',
    payers: [],
    participants: [],
    image: null,
    currency: 'EUR',
    amount: '0',
    category: 'shopping',
    group_id: groupId,
    inputDate: new Date(),
  });

  const isUpdating = !!updatingExpense;

  const {mutate: insertExpense} = useInsertExpense();
  const {mutate: updateExpense} = useUpdateExpense();
  const {data: members, isError: membersError, isLoading: membersLoading} = useMemberList(groupId);

  if (membersLoading) {
    return <ActivityIndicator/>;
  }

  if (membersError) {
    console.log(membersError);
    return <Text>Failed to fetch data</Text>;
  }

  const {title, description, payers, participants, image, currency, amount, group_id, inputDate, category} = formState;

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
    // console.log("Updating expense")
    // console.log(groupId, "//", title,"//", description,"//", currency,"//", amount,"//", inputDate,"//", payers,"//", participants)
    // const imagePath = await uploadImage(image);
    updateExpense({
      id: updatingExpense.id,
      amount: amount,
      currency: currency,
      date: formatDate(inputDate),
      description: description,
      category: category,
      participants: participants,
      payers: payers,
      proof: null,
      title: title
    }, {
      onSuccess: async () => {
        console.log('Successfully updated expense');
        navigation.goBack();
        await queryClient.invalidateQueries(['group', group_id]);
        await queryClient.invalidateQueries(['expense', updatingExpense.id]);
        await queryClient.invalidateQueries(['expenses', group_id]);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  const onCreate = async () => {
    // console.log(groupId, "//", title,"//", description,"//", currency,"//", amount,"//", inputDate,"//", payers,"//", participants)
    // const imagePath = await uploadImage(image);
    insertExpense({
      group_id: groupId,
      title: title,
      description: description ? description : null,
      currency: currency,
      category: category,
      amount: amount,
      date: formatDate(inputDate),
      proof: null,
      payers: payers,
      participants: participants
    }, {
      onSuccess: async () => {
        // console.log("Successfully inserted expense");
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

  const handleGenerateCat = async () => {
    // check if title is not empty
    if (!title) {
      Alert.alert('You must enter a title first');
      return;
    }

    setLoading(true);
    // make a call to the edge function
    const {data, error} = await supabase.functions.invoke('gemini', {
      body: JSON.stringify({"title": title})
    });
    setLoading(false);

    if (error) {
      console.error('Server error:', error);
      Alert.alert('Error', 'Server error.');
      return;
    }
    const exp_cat_names = exp_cats.map((exp_cat) => exp_cat?.name);
    const newName = data?.name?.toLowerCase();
    if (exp_cat_names.includes(newName)) {
      handleInputChange('category', newName);
    } else {
      handleInputChange('category', 'other');
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
            onChangeText={(text) => {
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
            onChangeText={(text) => {
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
            onChangeText={(text) => handleInputChange('amount', text.replace(',', '.').replace(/^0+(?!$)/, ''))}
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
          <MyMultiSelect
            selected={participants}
            members={members}
            onChange={(participants) => handleInputChange('participants', participants)}
          />
          <Text>Pick expense category or use AI to generate</Text>
          <View style={{flexDirection: "row", gap: 5}}>
            <Dropdown
              data={exp_cats}
              labelField={'name'}
              valueField={'name'}
              placeholder={!isFocus ? 'Select a category' : '...'}
              onChange={(item) => {
                handleInputChange('category', item.name);
                setIsFocus(false);
              }}
              style={[styles.currencyDropdown, {flex: 1, borderWidth: 0.5}]}
              selectedTextStyle={{marginLeft: 10}}
              renderItem={renderCatItem}
              value={category}
            />
            <Tooltip title="Auto generate">
              <Button style={{backgroundColor: 'white', justifyContent: "center", borderRadius: 10, flex: 1}}
                      onPress={handleGenerateCat} disabled={isLoading}>
                {isLoading ? <ActivityIndicator/> : <FontAwesome6 name={'wand-magic-sparkles'} size={18} color={'black'}/>}
              </Button>
            </Tooltip>
          </View>
          <TouchableOpacity onPress={() => {
            onSubmit();
          }}>
            <Text style={styles.saveIcon}>Save</Text>
          </TouchableOpacity>
          {/*<View style={{*/}
          {/*  flexDirection: "row",*/}
          {/*  gap: 15,*/}
          {/*  backgroundColor: 'white',*/}
          {/*  borderRadius: 10,*/}
          {/*  padding: 12,*/}
          {/*  alignItems: "center"*/}
          {/*}}>*/}
          {/*  <Text>Proof of payment: (optional)</Text>*/}
          {/*  <Text variant={'labelLarge'} style={{*/}
          {/*    borderWidth: 1,*/}
          {/*    borderColor: 'maroon',*/}
          {/*    borderRadius: 5,*/}
          {/*    paddingHorizontal: 5,*/}
          {/*    paddingVertical: 3*/}
          {/*  }} onPress={pickImage}>Select Image </Text>*/}
          {/*  {image && <Avatar.Image source={{uri: image}} size={24}/>}*/}
          {/*</View>*/}
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
  saveIcon: {
    fontSize: 28,
    fontWeight: "400",
    width: '100%',
    textAlign: 'center',
    marginRight: 10,
    borderWidth: 1,
    padding: 10,
    borderColor: 'green',
    borderRadius: 10,
    color: 'green',
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
  line: {
    flexDirection: "row",
    height: 60,
    paddingVertical: 5,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  lineLabel: {
    fontSize: 16
  },
});
