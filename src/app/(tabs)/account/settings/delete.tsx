import {View, TouchableOpacity, Alert} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import React, {useState} from "react";
import {useNavigation} from "expo-router";
import {Feather} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {supabase} from "@/src/lib/supabase.ts";
import {useAuth} from "@/src/providers/AuthProvider.tsx";

const Delete = () => {
  const navigation = useNavigation();
  const [verif, setVerif] = useState('');
  const [errorText, setErrorText] = useState('');
  const {setSession} = useAuth();

  const verifText = "I understand and want to delete my account";

  const handleDelete = async () => {
    if (verif == verifText) {
      setErrorText('');
    } else {
      setErrorText("Typed input doesn't match verifier\nDo not use quotations");
      return;
    }

    const {error} = await supabase.rpc('deleteuser');

    if (error) {
      console.error('Server error:', error);
      Alert.alert('Error', 'There was an error deleting the account. Please try again.');
    } else {
      setSession(null);
    }
  };

 return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="h-16 px-4 flex-row justify-start items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={36} />
        </TouchableOpacity>
      </View>
      <View className="flex-1 p-4 justify-center">
        <Text className="text-4xl font-semibold mb-4 mx-auto">DELETE ACCOUNT</Text>
        <Text className="text-xl text-gray-600 mb-4">This action is undoable, all data related to the account will be lost forever.</Text>
        <Text className="text-2xl text-red-600 mb-2">Are you sure you want to delete your account?</Text>
        <Text className="text-2xl mb-2">Please type, <Text className="font-bold">"{verifText}"</Text></Text>
        <TextInput
          value={verif}
          onChangeText={setVerif}
          placeholder=""
          className="w-full border-gray-300 border rounded-md px-4 mb-2 bg-white text-sm"
        />
        {errorText && <Text className="text-red-600 mb-2">{errorText}</Text>}
        <View className="flex-row justify-center gap-4 px-5">
          <TouchableOpacity
            onPress={handleDelete}
            className="w-1/2 bg-white font-bold py-3 rounded-md items-center"
          >
            <Text className={'text-xl font-semibold text-red-500'}>
              Delete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-1/2 bg-white font-bold py-3 rounded-md items-center"
          >
            <Text className={'text-xl font-semibold'}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Delete;
