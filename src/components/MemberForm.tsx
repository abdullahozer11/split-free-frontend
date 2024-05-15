import React from "react";
import {useNavigation} from "expo-router";
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Feather} from "@expo/vector-icons";
import {Text} from "react-native-paper";


export default function MemberForm({title: headerTitle, groupId, updatingMember}) {
  const navigation = useNavigation();

  const onSubmit = () => {
    console.log('submitting');
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
  title: {
    marginTop: 10,
    marginBottom: 20,
  },
});
