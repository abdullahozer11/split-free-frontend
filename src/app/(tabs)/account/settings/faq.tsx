import {StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Feather} from "@expo/vector-icons";
import {Card} from "react-native-paper";
import {useNavigation} from "expo-router";
import {faqText} from "@/faq";

const FAQ = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => {navigation.goBack()}}>
          <Feather name={"arrow-left"} size={36}/>
        </TouchableOpacity>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={{alignSelf: "center"}} variant={'headlineLarge'}>FAQ</Text>
            <Text style={styles.text}>{faqText}</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQ;

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
