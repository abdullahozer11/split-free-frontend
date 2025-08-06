import { TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import { Feather } from "@expo/vector-icons";
import { faqText as enFaq } from "@/src/international/en/faq";
import { faqText as frFaq } from "@/src/international/fr/faq";
import { faqText as deFaq } from "@/src/international/de/faq";
import { faqText as esFaq } from "@/src/international/es/faq";
import { faqText as trFaq } from "@/src/international/tr/faq";
import { faqText as grFaq } from "@/src/international/gr/faq";
import { faqText as ruFaq } from "@/src/international/ru/faq";
import { faqText as itFaq } from "@/src/international/it/faq";
import { useNavigation } from "expo-router";
import { useSettings } from "@/src/providers/SettingsProvider.js";

const FAQ = () => {
  const navigation = useNavigation();
  const {settings} = useSettings();
  const lan = settings.language || 'en';

  const faqMap = {
    en: enFaq,
    fr: frFaq,
    de: deFaq,
    es: esFaq,
    tr: trFaq,
    gr: grFaq,
    ru: ruFaq,
    it: itFaq,
  };

  const currentFaq = faqMap[lan] || enFaq;

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={36} />
      </TouchableOpacity>
      <ScrollView className="flex-1">
        <Markdown>{currentFaq}</Markdown>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQ;
