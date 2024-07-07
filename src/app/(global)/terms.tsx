import { ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import { Feather } from "@expo/vector-icons";
import { termsText } from "@/TermsOfUse";
import { useNavigation } from "expo-router";

const Terms = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="flex-1 p-4 bg-gray-100">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={36} />
      </TouchableOpacity>
      <ScrollView contentInsetAdjustmentBehavior="automatic" className="h-full">
        <Markdown>{termsText}</Markdown>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Terms;
