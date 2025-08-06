import { ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import { Feather } from "@expo/vector-icons";
import { termsText as enTerms } from "@/src/international/en/terms";
import { termsText as frTerms } from "@/src/international/fr/terms";
import { termsText as deTerms } from "@/src/international/de/terms";
import { termsText as esTerms } from "@/src/international/es/terms";
import { termsText as trTerms } from "@/src/international/tr/terms";
import { termsText as grTerms } from "@/src/international/gr/terms";
import { termsText as ruTerms } from "@/src/international/ru/terms";
import { termsText as itTerms } from "@/src/international/it/terms";
import { useNavigation } from "expo-router";
import { useSettings } from "@/src/providers/SettingsProvider.js";

const Terms = () => {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const lan = settings.language || 'en';

  const termsMap = {
    en: enTerms,
    fr: frTerms,
    de: deTerms,
    es: esTerms,
    tr: trTerms,
    gr: grTerms,
    ru: ruTerms,
    it: itTerms,
  };

  const currentTerms = termsMap[lan] || enTerms;

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={36} />
      </TouchableOpacity>
      <ScrollView className="flex-1">
        <Markdown>{currentTerms}</Markdown>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Terms;
