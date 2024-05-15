import {StyleSheet, View, TouchableOpacity, Pressable} from 'react-native';
import {Avatar, Button, Divider, Text} from 'react-native-paper';
import React, {useEffect, useState} from "react";
import {Feather} from "@expo/vector-icons";
import {Link} from "expo-router";

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

export const Member = ({member, assignable, onAssign, myOwnMember}) => {
  return (
    <Link href={`/(tabs)/group/${member.group_id}/member/${member.id}/details`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.subContainer}>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
            <Avatar.Image size={36}
                          source={member.profile?.avatar_url ? {uri: member.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}/>
            <Text variant={"bodyLarge"}>{member.name}</Text>
          </View>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
            {myOwnMember && <Text variant={"labelMedium"} color={'green'}>Me</Text>}
            {member.role === 'owner' ? <Feather name={'award'} size={24} color={'silver'}/> : null}
            {assignable && <TouchableOpacity onPress={onAssign}>
              <Feather name={'plus-circle'} size={24} color={'green'}/>
            </TouchableOpacity>}
          </View>
        </View>
      </Pressable>
    </Link>
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
        <Avatar.Image size={36} source={profile.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{profile.email}</Text>
        {profile.friend_status === 'AVAILABLE' && <TouchableOpacity onPress={() => onAdd(profile.id)}>
          <Feather name={'user-plus'} size={24}/>
        </TouchableOpacity>}
        {profile.friend_status === 'FRIEND' && <Feather name={'user-check'} size={24} color={'green'}/>}
        {profile.friend_status === 'SENT' && <Button onPress={() => {console.log('pressed')}}>Pending</Button>}
        {profile.friend_status === 'RECEIVED' && <Button onPress={() => {console.log('pressed')}}>Accept</Button>}
      </View>
    </View>
  );
};

export const Friend = ({email, avatar_url, onRemove}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, {justifyContent: 'space-between'}]}>
        <Avatar.Image size={36} source={avatar_url ? {uri: avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{email}</Text>
        <TouchableOpacity onPress={onRemove}>
          <Feather name={'user-x'} size={24}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const Friend2 = ({email, avatar_url, onInvite}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, {justifyContent: 'space-between'}]}>
        <Avatar.Image size={36} source={avatar_url ? {uri: avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{email}</Text>
        <TouchableOpacity onPress={onInvite}>
          <Feather name={'user-plus'} size={24}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const NotifLine = ({text, onAccept, onIgnore}) => {
  return (
    <>
      <View style={styles.notifLine}>
        <Text>{text}</Text>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity onPress={onAccept}>
            <Feather name={"check"} size={24} color={"green"}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={onIgnore}>
            <Feather name={"x"} size={24} color={"red"}/>
          </TouchableOpacity>
        </View>
      </View>
      <Divider/>
    </>
  );
};

export const GroupInvite = ({invite, onAccept, onReject}) => {
  return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <Text>{invite.sender_profile.email} invited you to group "{invite.group_name}"</Text>
        </View>
        <View style={{flexDirection: "row", gap: 10, marginLeft: 10}}>
          <TouchableOpacity style={{borderWidth: 1, borderRadius: 5, padding: 5, backgroundColor: 'green'}} onPress={onAccept}>
            <Feather name={'check'} size={24}/>
          </TouchableOpacity>
          <TouchableOpacity style={{borderWidth: 1, borderRadius: 5, padding: 5, backgroundColor: 'red'}} onPress={onReject}>
            <Feather name={'x'} size={24}/>
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
    justifyContent: "space-between",
  },
  notifLine: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
