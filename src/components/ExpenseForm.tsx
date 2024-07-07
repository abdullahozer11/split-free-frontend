import React, {useState} from "react";
import {useNavigation} from "expo-router";
import {useMemberList} from "@/src/api/members";
import {
  useInsertExpense,
  useUpdateExpense
} from "@/src/api/expenses";
import {Alert, Pressable, ScrollView, TouchableOpacity, View} from "react-native";
import {getFormattedDate, formatDate} from "@/src/utils/helpers";
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
    <View className={'flex-row h-12 px-2 justify-between items-center'}>
      <Text variant={'titleSmall'}>{item.name}</Text>
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
    category: 'Other',
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
    return <Text variant={'headlineLarge'}>Failed to fetch data</Text>;
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

    if (!payers.length) {
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
    const newName = data?.name;
    // console.log("new name is ", newName);
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
    <ScrollView className={'flex-1'}>
      <View className={'mt-1 bg-transparent flex-row justify-between items-center'}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather className={'font-bold'} name={"arrow-left"} size={32}/>
        </TouchableOpacity>
        <TouchableOpacity className={'bg-white w-24 h-12 rounded-md justify-center items-center'} onPress={() => {
          onSubmit();
        }}>
          <Text variant={"headlineLarge"} className={'font-semibold'}>Save</Text>
        </TouchableOpacity>
      </View>
      <Text variant="headlineLarge" className={'my-3'}>{headerTitle}</Text>
      <View className={'gap-2'}>
        <View>
          <TextInput
            label="Enter expense title"
            placeholder="Describe your expense"
            value={title}
            onChangeText={(text) => {
              handleInputChange('title', text);
            }}
            className={'bg-white'}
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
            className={'bg-white'}
          />
        </View>
        <View className={'flex-row gap-x-1'}>
          <TextInput
            label="Enter amount"
            placeholder="Enter amount"
            value={amount}
            onChangeText={(text) => handleInputChange('amount', text.replace(',', '.').replace(/^0+(?!$)/, ''))}
            keyboardType="numeric"
            className={'flex-1 bg-white'}
          />
          <Dropdown
            placeholder={'Select currency'}
            className={"rounded-md text-xl text-pink-300 bg-white px-2 w-16"}
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
            className={'bg-white px-2 rounded justify-center'}
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
        <View style={{gap: 10}}>
          <View style={{gap: 10}} className={'flex-row items-center'}>
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
          <Text variant={'bodyLarge'}>Pick expense category or use AI to generate</Text>
          <View className={'flex-row gap-4'}>
            <Dropdown
              data={exp_cats}
              labelField={'name'}
              valueField={'name'}
              placeholder={!isFocus ? 'Select a category' : '...'}
              onChange={(item) => {
                handleInputChange('category', item.name);
                setIsFocus(false);
              }}
              className={"flex-1 rounded-md text-xl text-pink-300 bg-white p-2"}
              selectedTextStyle={{marginLeft: 10}}
              renderItem={renderCatItem}
              value={category}
              dropdownPosition={'top'}
            />
            <Tooltip title="Auto generate">
              <Button className={'bg-white justify-center rounded-md flex-1'}
                      onPress={handleGenerateCat} disabled={isLoading}>
                {isLoading ? <ActivityIndicator/> : <FontAwesome6 name={'wand-magic-sparkles'} size={18} color={'black'}/>}
              </Button>
            </Tooltip>
          </View>
          <TouchableOpacity className={'bg-white rounded-md border-2 border-green-500'} onPress={() => {
            onSubmit();
          }}>
            <Text className={'font-bold text-center py-4 text-green-500'}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
