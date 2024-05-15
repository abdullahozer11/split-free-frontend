import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import MemberForm from "@/src/components/MemberForm";
import {useLocalSearchParams} from "expo-router";
import {useMember} from "@/src/api/members";
import {Text, ActivityIndicator} from "react-native-paper";

export default function UpdateMember() {
  const {group_id: groupIdString, member_id: memberIdString} = useLocalSearchParams();
  const memberId = parseInt(typeof memberIdString === 'string' ? memberIdString : memberIdString[0]);
  const group_id = parseInt(typeof groupIdString === 'string' ? groupIdString : groupIdString[0]);

  const {data: member, error: memberError, isLoading: memberLoading} = useMember(memberId);

  if (memberLoading) {
    return <ActivityIndicator/>;
  }

  if (memberError) {
    return <Text>Failed to fetch data</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <MemberForm title={"Update Member"} groupId={group_id} updatingMember={member}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
