import { TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import { Feather } from "@expo/vector-icons";
import { faqText } from "@/faq";
import { useNavigation } from "expo-router";

const FAQ = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={36} />
      </TouchableOpacity>
      <ScrollView className="flex-1">
        <Markdown>{faqText}</Markdown>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQ;
