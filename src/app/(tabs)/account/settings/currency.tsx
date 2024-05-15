import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {CurrencySelector} from "@/src/components/CurrencySelector";
import {Feather} from "@expo/vector-icons";
import {useNavigation} from "expo-router";

const Currency = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather name={"arrow-left"} size={36}/>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text variant={'headlineLarge'}>Select Currency</Text>
        <CurrencySelector/>
      </View>
    </SafeAreaView>
  );
};

export default Currency;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
