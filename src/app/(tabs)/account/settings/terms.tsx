import {ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text} from 'react-native-paper';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Feather} from "@expo/vector-icons";
import {termsText} from "@/TermsOfUse";
import {useNavigation} from "expo-router";

const Terms = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => {navigation.goBack()}}>
          <Feather name={"arrow-left"} size={36}/>
        </TouchableOpacity>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={{alignSelf: "center"}} variant={'headlineLarge'}>TERM OF USE</Text>
            <Text style={styles.text}>{termsText}</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Terms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F6F6F6FF",
  },
  header: {
    marginTop: 10,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    marginVertical: 8,
    backgroundColor: "white",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});
