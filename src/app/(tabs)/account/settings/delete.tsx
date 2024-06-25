import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Text, TextInput, Button} from 'react-native-paper';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather name={"arrow-left"} size={36}/>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text variant={'headlineMedium'}>DELETE ACCOUNT</Text>
        <Text variant={'labelMedium'}>This action is undoable, all data related to the account will be lost forever</Text>
        <Text style={styles.redText}>Are you sure you want to delete your account?</Text>
        <Text>Please type, </Text><Text style={{fontWeight: 700}}>"{verifText}"</Text>
        <TextInput
          value={verif}
          onChangeText={setVerif}
          placeholder=""
          style={styles.input}
        />
        {errorText && <Text style={styles.redText}>{errorText}</Text>}
        <View style={styles.row}>
          <Button contentStyle={{backgroundColor: "white", padding: 10}} labelStyle={{color: "red"}} onPress={handleDelete}>DELETE</Button>
          <Button contentStyle={{backgroundColor: "white", padding: 10}} onPress={() => navigation.goBack()}>CANCEL</Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Delete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6FF",
  },
  header: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  input: {
    backgroundColor: 'white',
    width: '100%'
  },
  redText: {
    color: 'red'
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
});
