import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {Text, HelperText, TextInput, Avatar, ActivityIndicator} from "react-native-paper";
import MyDropdown from "@/src/components/DropdownComponent";
import MyMultiSelect from "@/src/components/MultiSelectComponent";
import {useMemberList} from "@/src/api/members";
import * as ImagePicker from "expo-image-picker";
import {Feather} from "@expo/vector-icons";
import {useNavigation} from "expo-router";
import { DatePickerInput } from 'react-native-paper-dates'

export default function Layout() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payer, setPayer] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  const [inputDate, setInputDate] = useState<Date | undefined>(undefined);

  const {data: members, error, isLoading} = useMemberList();
 const {mutate: insertExpense} = useInsertExpense();

  const handleSubmit = () => {
    insertExpense({
      title: title,
      description: description,
      participants: participants,
      payer: payer,
      date: inputDate?.toString(),
      amount: amount, // todo implement
      currency: currency, // todo implement
      // group: group, // current group
    }, {
      onSuccess: () => {
        console.log("Successfully updated profile");
      }
    });
  };


  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (error) {
    return <Text>Failed to fetch members</Text>;
  }

  const _isTitleValid = () => {
    // return !!title;
    return true;
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
      <Text variant="headlineLarge">New Expense</Text>
      <View>
        <TextInput
          label="Enter expense title"
          placeholder="Describe your expense"
          value={title}
          error={!_isTitleValid()}
          onChangeText={setTitle}
        />
        <HelperText type="error" visible={!_isTitleValid()}>
          Title cannot be empty
        </HelperText>
      </View>
      <View>
        <TextInput
          label="Enter expense description"
          placeholder="Give additional information"
          value={description}
          onChangeText={setDescription}
          multiline={true}
        />
        <DatePickerInput
          locale="en"
          label="Birthdate"
          value={inputDate}
          onChange={(d) => setInputDate(d)}
          inputMode="start"
          autoComplete="birthdate-full"
          // mode="outlined" (see react-native-paper docs)
          // other react native TextInput props
        />
      </View>

      <View style={{gap: 20, marginTop: 20}}>
        <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
          <Avatar.Image size={48} source={require('@/assets/images/blank-profile.png')}/>
          <MyDropdown selected={payer} data={members} onChange={setPayer} label={"Who paid"}/>
        </View>
        <MyMultiSelect selected={participants} members={members} onChange={setParticipants}/>
        <View style={{flexDirection: "row", gap: 15}}>
          <Text>Proof of payment: (optional)</Text>
          <Text onPress={pickImage}>Select Image </Text>
          <Avatar.Image style={{display: image ? 1 : "none"}} size={24}
                        source={require('@/assets/images/blank-profile.png')}/>
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
});
