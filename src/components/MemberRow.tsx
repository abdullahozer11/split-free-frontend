import {StyleSheet, View, Text, Image} from 'react-native';
import React from "react";

const MemberRow = ({member}) => {
  return (
    <View style={styles.container}>
      <Image
        source={member?.profile?.avatar_url ? {uri: member?.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}
        style={styles.avatar}/>
      <View>
        <Text style={styles.memberName}>{member?.profile.full_name}</Text>
        <Text style={styles.memberRole}>{member.role || 'member'}</Text>
      </View>
    </View>
  );
};

export default MemberRow;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: "100%",
    height: 60,
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '500',
  },
});
