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
        <View style={[styles.subContainer, {justifyContent: 'space-between'}]}>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
            <Avatar.Image size={36}
                          source={member.profile?.avatar_url ? {uri: member.profile?.avatar_url} : require('@/assets/images/blank-profile.png')}/>
            <Text variant={"bodyLarge"} numberOfLines={1} style={{width: 200}}>
              {member.name}</Text>
          </View>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center", marginRight: 10}}>
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
      <View style={styles.subContainer}>
        <Avatar.Image size={36}
                      source={borrower?.profile?.avatar_url ? { uri: borrower.profile?.avatar_url } : require('@/assets/images/blank-profile.png')}
        />
        <Text style={styles.nameText} numberOfLines={1}>{borrower?.name}</Text>
        <Feather name={'arrow-right'} size={36} />
        <Text style={styles.nameText} numberOfLines={1}>{lender?.name}</Text>
        <Avatar.Image size={36}
                      source={lender?.profile?.avatar_url ? { uri: lender.profile?.avatar_url } : require('@/assets/images/blank-profile.png')} />
        <Text variant={'labelLarge'}>€ {debt?.amount?.toFixed(2)} </Text>
      </View>
    </View>
  );
};

export const SearchProfile = ({profile, onAdd, onCancel}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, {justifyContent: 'space-between'}]}>
        <Avatar.Image size={36} source={profile.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{profile.email}</Text>
        {profile.friend_status === 'AVAILABLE' && <TouchableOpacity onPress={() => onAdd(profile.id)}>
          <Feather name={'user-plus'} size={24}/>
        </TouchableOpacity>}
        {profile.friend_status === 'FRIEND' && <Feather name={'user-check'} size={24} color={'green'}/>}
        {profile.friend_status === 'SENT' && <Button onPress={() => onCancel(profile.id)}>Pending</Button>}
        {profile.friend_status === 'RECEIVED' && <Button onPress={() => {console.log('pressed on accept')}}>Accept</Button>}
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

export const Friend2 = ({email, avatar_url, onInvite, status}) => {
  return (
    <View style={[styles.container, {borderRadius: 0}]}>
      <View style={[styles.subContainer, {justifyContent: 'space-between'}]}>
        <Avatar.Image size={36} source={avatar_url ? {uri: avatar_url} : require('@/assets/images/blank-profile.png')}/>
        <Text variant={"bodyLarge"}>{email}</Text>
        {status === 'available' && <TouchableOpacity onPress={onInvite}><Feather name={'user-plus'} size={24}/></TouchableOpacity>}
        {status === 'invited' && <Text variant={'labelMedium'}>Invited</Text>}
        {status === 'member' && <Feather name={'user-check'} size={24}/>}
      </View>
    </View>
  );
};

export const NotifLine = ({email, onAccept, onIgnore}) => {
  return (
    <>
      <View style={styles.notifLine}>
        <Text>Invite from </Text>
        <Text style={{maxWidth: 220}} numberOfLines={1}>{email}</Text>
        <View style={{flexDirection: "row", gap: 5, paddingLeft: 10}}>
          <TouchableOpacity style={[styles.smallButton, {borderColor: "green"}]} onPress={onAccept}>
            <Feather name={"check"} size={24} color={"green"}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, {borderColor: "red"}]} onPress={onIgnore}>
            <Feather name={"x"} size={24} color={"red"}/>
          </TouchableOpacity>
        </View>
      </View>
      <Divider/>
    </>
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
    gap: 3,
  },
  nameText: {
    flex: 1,
    fontSize: 12,
    marginHorizontal: 5,
  },
  notifLine: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  smallButton: {
    borderWidth: 0.5,
    borderRadius: 5,
  },
});
