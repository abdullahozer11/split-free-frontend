import {StyleSheet, View, SafeAreaView, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import CollapsableHeader from '@/src/components/CollapsableHeader';
import { ActivityIndicator, Text, Card, Paragraph } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import {useMember, useProfileMember} from '@/src/api/members';
import {useAuth} from "@/src/providers/AuthProvider";
import {useProfile} from "@/src/api/profiles";

const MemberDetailsScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {member_id: memberIdString} = useLocalSearchParams();
  const memberId = parseInt(typeof memberIdString === 'string' ? memberIdString : memberIdString[0]);
  const {data: member, error: memberError, isLoading: memberLoading } = useMember(memberId);
  const {session} = useAuth();
  const {data: profile, isLoading, isError} = useProfile(session?.user.id);
  const {data: profileMember, error: profileMemberError, isLoading: profileMemberLoading} = useProfileMember(profile?.id, member?.group_id);

  if (isLoading || memberLoading || profileMemberLoading) {
    return <ActivityIndicator />;
  }

  if (isError || memberError || profileMemberError) {
    return <Text>Failed to fetch data</Text>;
  }

  // console.log('member is ', member);

  return (
    <SafeAreaView style={styles.container}>
      <CollapsableHeader
        H_MAX_HEIGHT={200}
        H_MIN_HEIGHT={52}
        content={
          <View style={styles.content}>
            <Card>
              <Card.Content>
                <TouchableOpacity style={{position: "absolute", top: 10, right: 10}} onPress={() => {
                  router.push({
                    pathname: "/(tabs)/group/[group_id]/member/[member_id]/update",
                    params: {group_id: member?.group_id, member_id: member?.id}
                  });
                }
                }>
                  <Feather style={styles.icon} name={"edit"} size={24}/>
                </TouchableOpacity>
                <View style={styles.avatarContainer}>
                  <Image
                    source={member.profile?.avatar_url ? {uri: member.profile.avatar_url} : require('@/assets/images/blank-profile.png')}
                    style={styles.avatar}/>
                </View>
                <Paragraph>Group: {member.group.title}</Paragraph>
                <Paragraph>Name: {member.name}</Paragraph>
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
