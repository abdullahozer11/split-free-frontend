import {StyleSheet, View, SafeAreaView, TouchableOpacity, Image, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import CollapsableHeader from '@/src/components/CollapsableHeader';
import {ActivityIndicator, Text, Card, Paragraph, TextInput, Button, Dialog, Portal} from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import {useDeleteMember, useMember, useProfileMember, useUpdateMemberName} from '@/src/api/members';
import {useAuth} from "@/src/providers/AuthProvider";
import {useDebt} from "@/src/api/debts";
import {useQueryClient} from "@tanstack/react-query";

const MemberDetailsScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {member_id: memberIdString} = useLocalSearchParams();
  const memberId = parseInt(typeof memberIdString === 'string' ? memberIdString : memberIdString[0]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [name, setName] = useState();

  const {session} = useAuth();

  const {data: member, isError: memberError, isLoading: memberLoading } = useMember(memberId);
  const {data: profileMember, isError: profileMemberError, isLoading: profileMemberLoading} = useProfileMember(session?.user.id, member?.group_id);
  const {data: debt, isError: debtError, isLoading: debtLoading } = useDebt(memberId, profileMember?.id);

  const {mutate: updateMemberName} = useUpdateMemberName();
  const {mutate: deleteMember} = useDeleteMember();

  useEffect(() => {
    setName(member?.name);
  }, [member]);

  if (memberLoading || profileMemberLoading || debtLoading) {
    return <ActivityIndicator />;
  }

  if (memberError || profileMemberError || debtError) {
    return <Text>Failed to fetch data</Text>;
  }

  const ownMember = member?.id == profileMember?.id;
  const isEditable = !member?.profile || ownMember;

  const handleNameSubmit = () => {
    updateMemberName({
      name,
      member_id: member.id
    }, {
      onSuccess: async () => {
        console.log('Member name update is dealt with success');
        setIsEditingName(false);
        await queryClient.invalidateQueries(['member', memberId]);
        await queryClient.invalidateQueries(['members', member.group_id]);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    })
  };

  const handleDelete = () => {
    deleteMember(member?.id, {
      onSuccess: async () => {
        // console.log("Successfully deleted member");
        navigation.goBack();
        await queryClient.invalidateQueries(['members', member?.group_id]);
        await queryClient.invalidateQueries(['expense']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CollapsableHeader
        H_MAX_HEIGHT={200}
        H_MIN_HEIGHT={52}
        content={
          <View style={styles.content}>
            <Card>
              <Card.Content>
                <View style={styles.avatarContainer}>
                  <Image
                    source={member.profile?.avatar_url ? {uri: member.profile.avatar_url} : require('@/assets/images/blank-profile.png')}
                    style={styles.avatar}/>
                </View>
                <Paragraph>Group: {member.group.title}</Paragraph>
                {!isEditingName && <View style={{flexDirection: "row", gap: 5}}>
                  <Paragraph>
                    Name: {member.name}
                  </Paragraph>
                  {isEditable && <TouchableOpacity onPress={() => {
                    setIsEditingName(true);
                  }}>
                    <Feather name={'edit'} size={20}/>
                  </TouchableOpacity>}
                </View>}
                {isEditingName && <View style={{flexDirection: "row", alignItems: 'center'}}>
                  <TextInput
                    placeholder="Enter query key"
                    onChangeText={setName}
                    value={name}
                    style={{flex: 1, backgroundColor: "beige"}}
                  />
                  <Button onPress={handleNameSubmit}>
                    <Feather name={'check'} size={26} />
                  </Button>
                </View>}
                <Paragraph>Attached to Profile: {member.profile?.email || 'None'}</Paragraph>
                <Paragraph>Role: {member.role} {member.role === 'owner' ? <Feather name={'award'} size={18} color={'silver'}/> : null}</Paragraph>
                <Paragraph>Total Balance: <Paragraph style={{color: member.total_balance >= 0 ? 'green' : 'red'}}>${member.total_balance.toFixed(2)}</Paragraph></Paragraph>
                  {!ownMember && debt && (debt.amount >= 0 ? <Paragraph>Owes you: €{debt.amount}</Paragraph> : <Paragraph>You owe: €{debt.amount}</Paragraph>)}
              </Card.Content>
            </Card>
          </View>
        }
        headerContent={
          <View style={styles.header}>
            <View style={styles.headerBar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={36} color="white" />
              </TouchableOpacity>
              {isEditable && <TouchableOpacity onPress={() => setIsDialogVisible(true)}>
                <Feather name={'trash'} size={24} color={'red'}/>
              </TouchableOpacity>}
            </View>
            <View style={styles.headerContent}>
              <Text variant={'displaySmall'} style={styles.headerTitle}>
                {member?.name} {member.id == profileMember?.id && '(me)'}
              </Text>
              <Text style={{color: 'white'}}>Created At: {new Date(member.created_at).toLocaleString()}</Text>
            </View>
          </View>
        }
      />
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => {
          setIsDialogVisible(false);
        }}>
          <Dialog.Icon icon="alert"/>
          <Dialog.Title>Are you sure to delete this member?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default MemberDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 10,
    paddingVertical: 50,
    alignItems: "center",
    flex: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    marginBottom: 10,
    maxWidth: '70%',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 20,
    left: 0,
    backgroundColor: 'transparent',
  },
  headerContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
    avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#eee',
  },
  icon: {
    opacity: 0.6,
  },
});
