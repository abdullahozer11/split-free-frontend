import {StyleSheet, View, TouchableOpacity, Pressable} from 'react-native';
import React, {useEffect, useState} from "react";
import {Feather} from "@expo/vector-icons";
import {useDeleteGroup, useGroup} from "@/src/api/groups";
import {Link, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import ExpenseItem from "@/src/components/ExpenseItem";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {groupElementsByDay} from "@/src/utils/helpers";
import {TextInput, Menu, Text, Dialog, Button, Portal, ActivityIndicator, Modal} from 'react-native-paper';
import {useExpenseList} from "@/src/api/expenses";
import {Debt, Friend2, Member} from "@/src/components/Person";
import {getFriends, useAssignMember, useInsertGroupInvitation, useProfile} from "@/src/api/profiles";
import {useAuth} from "@/src/providers/AuthProvider";
import {useInsertMember, useProfileMember} from "@/src/api/members";

const GroupDetailsScreen = () => {
  const {group_id: idString} = useLocalSearchParams();
  const groupId = parseInt(typeof idString === 'string' ? idString : idString[0]);
  const navigation = useNavigation();
  const router = useRouter();
  const {data: group, error: groupError, isLoading: groupLoading} = useGroup(groupId);
  const {data: expenses, error: expenseError, isLoading: expenseLoading} = useExpenseList(groupId);
  const {session} = useAuth();
  const {data: friends, error: friendsError, isLoading: friendsLoading} = getFriends(session?.user.id);
  const {data: profile, error: profileError, isLoading: profileLoading} = useProfile(session?.user.id)
  const {data: profileMember, error: profileMemberError, isLoading: profileMemberLoading} = useProfileMember(profile?.id, groupId);
  const [totalBalance, setTotalBalance] = useState(0);
  const {mutate: deleteGroup} = useDeleteGroup();
  const {mutate: insertMember} = useInsertMember();
  const {mutate: assignMember} = useAssignMember();
  const {mutate: insertGroupInvitation} = useInsertGroupInvitation();
  // menu related
  const [visible, setVisible] = useState(false);
  const [isAddingNewName, setIsAddingNewName] = useState(false);
  const [isFriendSelectorVisible, setIsFriendSelectorVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const groupedExpenses = expenses ? groupElementsByDay(expenses) : [];

  useEffect(() => {
    const _balance = group?.members.find(mb => mb.profile && mb.profile.id == profile?.id)?.total_balance || null;
    setTotalBalance(_balance);
  }, [group]);

  if (groupLoading || expenseLoading || profileLoading || friendsLoading || profileMemberLoading) {
    return <ActivityIndicator/>;
  }

  if (groupError || expenseError || profileError || friendsError || profileMemberError) {
    return <Text variant={'displayLarge'}>Failed to fetch data</Text>;
  }

  const handleStats = () => {
    console.log('stats');
  };

  const promptDelete = () => {
    setIsDialogVisible(true);
  };

  const handleDelete = () => {
    console.log("deleting group");
    deleteGroup(group.id, {
      onSuccess: () => {
        console.log("Successfully deleted group with id ", group.id);
      }
    });
    navigation.goBack();
  };

  const promptInvite = () => {
    setIsFriendSelectorVisible(true);
  };

  const handleInvite = (id) => {
      insertGroupInvitation({
        sender: session?.user.id,
        receiver: id,
        group_id: groupId,
        group_name: group.title
      }, {
        onSuccess: () => {
          // console.log('Successfully inserted group invitation');
          setIsFriendSelectorVisible(false);
        }
      })
  };

  const handleAssign = (memberId) => {
    assignMember({
      _profile_id: profile.id,
      _member_id: memberId
    }, {
      onSuccess: () => {
        console.log('Member assign is dealt with success');
      }
    })
  };

  const handleNewMember = () => {
    insertMember({
      name: newMemberName,
      group_id: groupId
    }, {
      onSuccess: () => {
        console.log('New member addition is dealt with success');
        setNewMemberName('');
        setIsAddingNewName(false);
      }
    })
  };

  return (
    <View style={styles.container}>
      <CollapsableHeader H_MIN_HEIGHT={120} H_MAX_HEIGHT={240} content={
        <View style={styles.content}>
          {/*First Section*/}
          <View style={{padding: 20, flex: 1}}>
            <View style={{flexDirection: "row", marginHorizontal: 15, paddingBottom: 30}}>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18}}>Group spent:</Text>
                <Text style={{fontSize: 24, fontWeight: "bold"}}>{group?.expense_total || 0}€</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18}}>Total Receivable:</Text>
                <Text style={{fontSize: 24, fontWeight: "bold", color: "green"}}>
                    {totalBalance || 0}€
                </Text>
              </View>
            </View>
            <View style={styles.section}>
              <View>
                {Object.keys(groupedExpenses).map((item) => (
                  <View style={styles.activityGroup} key={item}>
                    <Text variant={'titleMedium'}>{item}</Text>
                    {groupedExpenses[item].map((expense) => (
                      <ExpenseItem key={expense.id} expense={expense}/>
                    ))}
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
                <Text variant={'titleMedium'}>Members</Text>
                <TouchableOpacity onPress={() => {setIsAddingNewName(true)}}>
                  <Feather name={'plus-circle'} size={18} color={'green'}/>
                </TouchableOpacity>
              </View>
              {group?.members && group?.members?.map(member => (
                  member.visible ? <Member key={member.name}
                                           member={member}
                                           myOwnMember={member.id == profileMember?.id}
                                           assignable={!profileMember?.visible && !member.profile}
                                           onAssign={() => {handleAssign(member.id)}} /> : null
                )
              )}
              {
                isAddingNewName &&
                <View style={{flexDirection: 'row', alignItems: "center"}}>
                  <TextInput
                    value={newMemberName}
                    onChangeText={setNewMemberName}
                    placeholder={'Enter new member name'}
                    style={{flex: 1, backgroundColor: 'white'}}
                  />
                  <Pressable style={{marginLeft: 10}} onPress={handleNewMember}>
                    <Feather name={'check'} color={'green'} size={24}/>
                  </Pressable>
                </View>
              }
            </View>
            <View style={[styles.section, {flex: 1}]}>
              {group?.debts.length != 0 && <Text variant={'titleMedium'}>Debts</Text>}
              {group?.debts && group?.debts?.map(debt => (
                  <Debt key={debt.id} debt={debt} members={group?.members}/>
                )
              )}
            </View>
            <View style={styles.section}>
              <Link href={`/(tabs)/group/${groupId}/expense/create`} asChild>
                <Pressable style={styles.newExpenseBtn}>
                  <Feather name={"plus"} size={36}/>
                  <Text variant={'titleMedium'}>Expense</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      } headerContent={
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => {
              navigation.goBack();
            }}>
              <Feather name="arrow-left" size={36} color="gold"/>
            </TouchableOpacity>
            <View style={{flexDirection: "row", gap: 10}}>
              <TouchableOpacity onPress={handleStats}>
                <Feather name="pie-chart" size={36} color="gold"/>
              </TouchableOpacity>
              <Menu
                visible={visible}
                onDismiss={closeMenu}
                contentStyle={{backgroundColor: "white"}}
                anchor={
                  <TouchableOpacity onPress={openMenu}>
                    <Feather name="more-horizontal" size={36} color="gold"/>
                  </TouchableOpacity>
                }>
                <Menu.Item onPress={() => {
                  closeMenu();
                  router.push({pathname: "/(tabs)/group/[group_id]/update", params: {group_id: groupId}});
                }} title="Edit Group"/>
                <Menu.Item onPress={() => {
                  promptDelete();
                  closeMenu();
                }} title="Delete Group"
                           titleStyle={{color: "red"}}
                />
                <Menu.Item onPress={() => {
                  promptInvite();
                }} title="Invite a person"
                           titleStyle={{color: "blue"}}
                />
              </Menu>
            </View>
          </View>
          <View/>
          <Text style={styles.headerTitle}>{group.title}</Text>
          <Text style={styles.syncInfo}>Last Sync On January 21, 2024</Text>
        </View>
      }
      />
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => {
          setIsDialogVisible(false);
        }}>
          <Dialog.Icon icon="alert"/>
          <Dialog.Title>Are you sure to delete this group?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/*Start Friend Selector for invite*/}
      <Modal visible={isFriendSelectorVisible} onDismiss={() => {setIsFriendSelectorVisible(false)}} contentContainerStyle={styles.friendSelector}>
        <View style={{height: 20, backgroundColor: 'white'}} />
        {friends?.map(({profile: {id, email, avatar_url}}) => (
          <Friend2 key={id} email={email} avatar_url={avatar_url} onInvite={() => handleInvite(id)}/>
        ))}
        <TouchableOpacity style={{position: "absolute", top: 2, right: 10}} onPress={() => {setIsFriendSelectorVisible(false)}} >
          <Feather name={'x'} size={28}/>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#F6F6F6FF",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    gap: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  syncInfo: {
    fontSize: 12,
    fontWeight: "300",
    color: "white",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 50,
    paddingHorizontal: 20,
    position: "absolute",
    top: 20,
    left: 0,
    backgroundColor: "transparent",
  },
  activityGroup: {
    marginTop: 10,
    gap: 10,
  },
  section: {
    marginBottom: 10,
    gap: 10
  },
  newExpenseBtn: {
    alignSelf: "flex-end",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderStyle: "dashed",
  },
  friendSelector: {
    width: '100%',
    paddingHorizontal: 10,
    alignSelf: "center",
    borderRadius: 20,
  },
});

export default GroupDetailsScreen;
