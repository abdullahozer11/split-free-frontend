import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import React, {useEffect, useState} from "react";
import {Feather} from "@expo/vector-icons";

export const Person = ({profile}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Avatar.Image size={36}
                      source={profile?.avatar_url ? {uri: profile?.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={'labelMedium'}>{profile?.full_name || 'John Doe'}</Text>
      </View>
      <Text variant={"bodyLarge"} style={{color: "white"}}>+ €36.62</Text>
    </View>
  );
};

export const Payer = ({payer, amount}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Avatar.Image size={36}
                      source={payer.avatar_url ? {uri: payer.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{payer.name}</Text>
      </View>
      <Text variant={"bodyLarge"} style={{color: "green"}}>€{amount}</Text>
    </View>
  );
};

export const Participant = ({participant, amount}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Avatar.Image size={36}
                      source={participant.avatar_url ? {uri: participant.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{participant.name}</Text>
      </View>
      <Text variant={"bodyLarge"} style={{color: "red"}}>€{amount}</Text>
    </View>
  );
};

export const Member = ({member}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Avatar.Image size={36}
                      source={member.profile?.avatar_url ? {uri: member.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{member.name}</Text>
        {member.role === 'owner' ? <Feather style={styles.badge} name={'award'} size={24} color={'silver'}/> : null}
      </View>
    </View>
  );
};

export const DeletableMember = ({member, onDelete}) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Avatar.Image size={36}
                      source={member.profile?.avatar_url ? {uri: member.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{member.name}</Text>
      </View>
      {member.role === 'owner' ? null : <TouchableOpacity onPress={onDelete}>
        <Feather name={"x"} color={'red'} size={24}/>
      </TouchableOpacity>}
    </View>
  );
};

export const Debt = ({debt, members}) => {
  const [lender, setLender] = useState(null);
  const [borrower, setBorrower] = useState(null);

  useEffect(() => {
    setLender(members?.find(member => member.id == debt?.lender));
    setBorrower(members?.find(member => member.id == debt?.borrower));
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, {justifyContent: "space-between"}]}>
        <Avatar.Image size={36}
                      source={borrower?.profile?.avatar_url ? {uri: borrower.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{borrower?.name}</Text>
        <Feather name={'arrow-right'} size={36}/>
        <Text variant={"bodyLarge"}>{lender?.name}</Text>
        <Avatar.Image size={36}
                      source={lender?.profile?.avatar_url ? {uri: lender.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={'labelLarge'}>€ {debt?.amount} </Text>
      </View>
    </View>
  );
};

export const SearchProfile = ({profile, onAdd}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, {justifyContent: 'space-between'}]}>
        <Avatar.Image size={36} source={profile?.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{profile.email}</Text>
        <TouchableOpacity onPress={onAdd}>
          <Feather name={'user-plus'} size={24}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const Friend = ({profile, onRemove}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, {justifyContent: 'space-between'}]}>
        <Avatar.Image size={36} source={profile?.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{profile.email}</Text>
        <TouchableOpacity onPress={onRemove}>
          <Feather name={'user-x'} size={24}/>
        </TouchableOpacity>
      </View>
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
  badge: {
    position: "absolute",
    right: 10,
  },
});
