import {StyleSheet, View, Text, Image} from 'react-native';
import React from "react";

export const Person = ({profile}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Image
          source={profile?.avatar_url ? {uri: profile?.avatar_url} : require('@/assets/images/blank-profile.png')}
          style={styles.avatar}/>
        <Text style={styles.memberName}>{profile?.full_name || 'John Doe'}</Text>
      </View>
      <Text style={styles.balanceP}>+ €36.62</Text>
    </View>
  );
};

export const Payer = ({payer}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Image
          source={payer.member.profile?.avatar_url ? {uri: payer.member.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}
          style={styles.avatar}/>
        <Text style={styles.memberName}>{payer.member.name}</Text>
      </View>
      <Text style={styles.balanceP}>€36.62</Text>
    </View>
  );
};

export const Participant = ({participant}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Image
          source={participant.member.profile?.avatar_url ? {uri: participant.member.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}
          style={styles.avatar}/>
        <Text style={styles.memberName}>{participant.member.name}</Text>
      </View>
      <Text style={styles.balanceP}>€36.62</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: "row",
    padding: 13,
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 20,
  },
  subContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceP: {
    fontSize: 16,
    fontWeight: '500',
    color: 'green',
  }
});
