import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import MemberForm from "@/src/components/MemberForm";
import {useLocalSearchParams} from "expo-router";

export default function NewMember() {
  const {group_id: idString} = useLocalSearchParams();
  const groupId = parseInt(typeof idString === 'string' ? idString : idString[0]);

  return (
    <SafeAreaView style={styles.container}>
      <MemberForm title={"New Member"} groupId={groupId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
