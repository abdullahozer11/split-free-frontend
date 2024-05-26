import {StyleSheet, View, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {useState} from "react";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import {Text, ActivityIndicator, Menu, Portal, Dialog, Button} from 'react-native-paper';
import {Feather} from "@expo/vector-icons";
import {useQueryClient} from "@tanstack/react-query";

const TransferDetailsScreen = () => {
  const {group_id: groupIdString, transfer_id: transferIdString} = useLocalSearchParams();
  const id = parseInt(typeof transferIdString === 'string' ? transferIdString : transferIdString[0]);
  const group_id = parseInt(typeof groupIdString === 'string' ? groupIdString : groupIdString[0]);
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Transfer Details</Text>
    </SafeAreaView>
  );
};

export default TransferDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
