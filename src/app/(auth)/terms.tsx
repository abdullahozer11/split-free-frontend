import {ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
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
      <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{height: '100%'}}
        >
          <Markdown>
            {termsText}
          </Markdown>
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
