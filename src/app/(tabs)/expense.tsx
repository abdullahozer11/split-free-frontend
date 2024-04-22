import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {Text, HelperText, TextInput, Avatar, ActivityIndicator} from "react-native-paper";
import MyDropdown from "@/src/components/DropdownComponent";
import MyMultiSelect from "@/src/components/MultiSelectComponent";
import {useMemberList} from "@/src/api/members";
import * as ImagePicker from "expo-image-picker";

export default function Layout() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payer, setPayer] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [image, setImage] = useState(null);

  const {data: members, error, isLoading} = useMemberList();

  console.log(payer);
  console.log(participants);

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
});
