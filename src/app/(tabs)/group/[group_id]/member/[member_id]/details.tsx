import {Alert, StyleSheet, View, SafeAreaView, TouchableOpacity, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Link, useLocalSearchParams, useNavigation} from 'expo-router';
import CollapsableHeader from '@/src/components/CollapsableHeader';
import {ActivityIndicator, Text, Card, Paragraph, TextInput, Button} from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import {useMember, useProfileMember, useUpdateMemberName} from '@/src/api/members';
import {useAuth} from "@/src/providers/AuthProvider";

const MemberDetailsScreen = () => {
  const navigation = useNavigation();
  const {member_id: memberIdString} = useLocalSearchParams();
  const memberId = parseInt(typeof memberIdString === 'string' ? memberIdString : memberIdString[0]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState();

  const {session} = useAuth();

  const {data: member, error: memberError, isLoading: memberLoading } = useMember(memberId);
  const {data: profileMember, error: profileMemberError, isLoading: profileMemberLoading} = useProfileMember(session?.user.id, member?.group_id);

  const {mutate: updateMemberName} = useUpdateMemberName();

  useEffect(() => {
    setName(member?.name);
  }, [member]);

  if (memberLoading || profileMemberLoading) {
    return <ActivityIndicator />;
  }

  if (memberError || profileMemberError) {
    return <Text>Failed to fetch data</Text>;
  }

  const handleNameSubmit = () => {
    updateMemberName({
      name,
      member_id: memberId
    }, {
      onSuccess: () => {
        console.log('member name update is dealt with success');
        setIsEditingName(false);
      },
      onError: () => {
        console.log('error is caught');
      }
    })
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
                  <TouchableOpacity onPress={() => {
                    setIsEditingName(true);
                  }}>
                    <Feather name={'edit'} size={20}/>
                  </TouchableOpacity>
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
                <Paragraph>Total Balance: <Paragraph style={{color: member.total_balance >= 0 ? 'green' : 'red'}}>${member.total_balance}</Paragraph></Paragraph>
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
              <Link href={`/(tabs)/group/${member?.group_id}]/member/${member?.id}/update`}>
                <Feather name={"edit"} style={styles.icon} size={24} color={"white"}/>
              </Link>
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
