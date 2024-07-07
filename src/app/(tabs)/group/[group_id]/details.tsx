import { View, TouchableOpacity, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  useDeleteGroup,
  useExitGroup,
  useGroup,
  useSettleGroup,
} from "@/src/api/groups";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { ExpenseItem } from "@/src/components/ExpenseItem";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import { groupElementsByDay } from "@/src/utils/helpers";
import {
  TextInput,
  Menu,
  Text,
  Dialog,
  Button,
  Portal,
  ActivityIndicator,
  Modal,
} from "react-native-paper";
import { useExpenseList } from "@/src/api/expenses";
import { Debt, Friend2, Member } from "@/src/components/Person";
import {
  useFriends,
  useAssignMember,
  useInsertGroupInvitation,
  usePendingGroupInvitesForGroup,
  useProfile,
} from "@/src/api/profiles";
import { useAuth } from "@/src/providers/AuthProvider";
import { useInsertMember, useProfileMember } from "@/src/api/members";
import { useQueryClient } from "@tanstack/react-query";
import { useExpenseSubscription } from "@/src/api/expenses/subscriptions";

const GroupDetailsScreen = () => {
  const { group_id: idString } = useLocalSearchParams();
  const groupId = parseInt(
    typeof idString === "string" ? idString : idString[0],
  );
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    data: group,
    isError: groupError,
    isLoading: groupLoading,
  } = useGroup(groupId);
  const {
    data: expenses,
    isError: expenseError,
    isLoading: expenseLoading,
  } = useExpenseList(groupId);
  const { session } = useAuth();
  const {
    data: friends,
    isError: friendsError,
    isLoading: friendsLoading,
  } = useFriends(session?.user.id);
  const {
    data: profile,
    isError: profileError,
    isLoading: profileLoading,
  } = useProfile(session?.user.id);
  const {
    data: pendingInvites,
    isError: pInviteError,
    isLoading: pInviteLoading,
  } = usePendingGroupInvitesForGroup(groupId);
  const {
    data: profileMember,
    isError: profileMemberError,
    isLoading: profileMemberLoading,
  } = useProfileMember(profile?.id, groupId);
  const [totalBalance, setTotalBalance] = useState(0);
  const { mutate: exitGroup } = useExitGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const { mutate: settleGroup } = useSettleGroup();
  const { mutate: insertMember } = useInsertMember();
  const { mutate: assignMember } = useAssignMember();
  const { mutate: insertGroupInvitation } = useInsertGroupInvitation();

  // menu related
  const [visible, setVisible] = useState(false);
  const [isAddingNewName, setIsAddingNewName] = useState(false);
  const [isFriendSelectorVisible, setIsFriendSelectorVisible] = useState(false);
  const [isGroupExiterVisible, setIsGroupExiterVisible] = useState(false);
  const [bigPlusVisible, setBigPlusVisible] = useState(true);
  const [newMemberName, setNewMemberName] = useState("");

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDialog2Visible, setIsDialog2Visible] = useState(false);
  const groupedExpenses = expenses ? groupElementsByDay(expenses) : [];
  const [updatedFriends, setUpdatedFriends] = useState([]);

  useEffect(() => {
    const _balance =
      group?.members
        .find((mb) => mb.profile && mb.profile.id === profile?.id)
        ?.total_balance?.toFixed(2) || null;
    setTotalBalance(_balance);
  }, [profile?.id, group]);

  useEffect(() => {
    // Create a list of member ids
    const memberIds = group?.members?.map((member) => member.profile?.id) || [];

    // Create a list of pending invite ids
    const pendingInviteIds = pendingInvites?.map(
      (invite) => invite.receiver_profile.id,
    );

    // Update friends with membership status
    const newUpdatedFriends = friends?.map((friend) => {
      const friendId = friend.profile.id;
      if (memberIds?.includes(friendId)) {
        return { ...friend, membershipStatus: "member" };
      } else if (pendingInviteIds?.includes(friendId)) {
        return { ...friend, membershipStatus: "invited" };
      } else {
        return { ...friend, membershipStatus: "available" };
      }
    });

    setUpdatedFriends(newUpdatedFriends);
  }, [friends, pendingInvites, group]);

  useExpenseSubscription(groupId);

  if (
    groupLoading ||
    expenseLoading ||
    profileLoading ||
    friendsLoading ||
    profileMemberLoading ||
    pInviteLoading
  ) {
    return <ActivityIndicator />;
  }

  if (
    groupError ||
    expenseError ||
    profileError ||
    friendsError ||
    profileMemberError ||
    pInviteError
  ) {
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  const promptDelete = () => {
    setIsDialogVisible(true);
  };

  const promptSettle = () => {
    setIsDialog2Visible(true);
  };

  const handleSettle = async () => {
    await settleGroup(group.id, {
      onSuccess: async () => {
        console.log("Successfully settled group with id", group.id);
        setIsDialog2Visible(false);
        await queryClient.invalidateQueries(["groups"]);
        await queryClient.invalidateQueries(["debts"]);
      },
      onError: (error) => {
        console.error("Server error:", error);
        Alert.alert("Error", "Server error.");
      },
    });
  };

  const handleDelete = async () => {
    await deleteGroup(group.id, {
      onSuccess: async () => {
        // console.log('Successfully deleted group with id', group.id);
        navigation.goBack();
        await queryClient.invalidateQueries(["groups"]);
      },
      onError: (error) => {
        console.error("Server error:", error);
        Alert.alert("Error", "Server error.");
      },
    });
  };

  const promptInvite = () => {
    setIsFriendSelectorVisible(true);
  };

  const promptExitGroup = () => {
    setIsGroupExiterVisible(true);
  };

  const handleExitGroup = () => {
    exitGroup(
      {
        _profile_id: session?.user.id,
        _group_id: groupId,
      },
      {
        onSuccess: async () => {
          // console.log("Group exited successfully");
          navigation.goBack();
          await queryClient.invalidateQueries(["groups"]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert(
            "Error",
            "There was an error exiting the group. Please try again.",
          );
        },
      },
    );
  };

  const handleInvite = (id) => {
    insertGroupInvitation(
      {
        sender: session?.user.id,
        receiver: id,
        group_id: groupId,
        group_name: group.title,
      },
      {
        onSuccess: () => {
          // console.log('Successfully inserted group invitation');
          setIsFriendSelectorVisible(false);
          queryClient.invalidateQueries(["group_invites_for_group"]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const handleAssign = (memberId) => {
    assignMember(
      {
        _member_id: memberId,
        _group_id: groupId,
      },
      {
        onSuccess: async () => {
          // console.log('Member assign is dealt with success');
          await queryClient.invalidateQueries(["members", groupId]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const handleNewMember = () => {
    insertMember(
      {
        name: newMemberName,
        group_id: groupId,
      },
      {
        onSuccess: async () => {
          // console.log('New member addition is dealt with success');
          setNewMemberName("");
          setIsAddingNewName(false);
          setBigPlusVisible(true);
          await queryClient.invalidateQueries(["members", groupId]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const isOwner = session?.user.id === group?.owner;

  return (
    <View className="bg-[#F6F6F6FF] flex-1">
      <CollapsableHeader
        H_MIN_HEIGHT={150}
        H_MAX_HEIGHT={240}
        content={
          <View className="flex-1">
            {/*First Section*/}
            <View className="p-5 flex-1">
              <View className="flex-row mx-4 pb-7">
                <View className="flex-1">
                  <Text variant="titleLarge">Group spent:</Text>
                  <Text variant="headlineMedium" className="font-bold">
                    {group?.expense_total || 0}€
                  </Text>
                </View>
                <View className="flex-1">
                  <Text variant="titleLarge">Total Receivable:</Text>
                  <Text
                    variant="headlineMedium"
                    className="text-green-600 font-bold"
                  >
                    {totalBalance || 0}€
                  </Text>
                </View>
                {/*last settlement date*/}
              </View>
              <View>
                <View className="flex-row items-center mb-2">
                  <Text variant={"titleLarge"} className="font-semibold">
                    Expenses
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: "/(tabs)/group/[group_id]/expense/create",
                        params: { group_id: groupId },
                      });
                    }}
                  >
                    <Feather name={"plus-circle"} size={18} color={"green"} />
                  </TouchableOpacity>
                </View>
                <View>
                  {Object.keys(groupedExpenses).map((item) => (
                    <View className="my-4 gap-y-5" key={item}>
                      <Text variant={"titleMedium"}>{item}</Text>
                      {groupedExpenses[item].map((expense) => (
                        <ExpenseItem key={expense.id} expense={expense} />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
              <View>
                <View className="flex-row items-center gap-x-2 mb-4">
                  <Text variant={"titleLarge"} className="font-semibold">
                    Members
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsAddingNewName(true);
                      setBigPlusVisible(false);
                    }}
                  >
                    <Feather name={"plus-circle"} size={18} color={"green"} />
                  </TouchableOpacity>
                </View>
                {group?.members &&
                  group?.members?.map((member) => (
                    <Member
                      key={member.name}
                      member={member}
                      myOwnMember={member.id === profileMember?.id}
                      assignable={!profileMember && !member.profile}
                      onAssign={() => {
                        handleAssign(member.id);
                      }}
                    />
                  ))}
                {isAddingNewName && (
                  <View className="flex-row items-center">
                    <TextInput
                      value={newMemberName}
                      onChangeText={setNewMemberName}
                      placeholder={"Enter new member name"}
                      className="flex-1 bg-white"
                    />
                    <Pressable className="ml-2" onPress={handleNewMember}>
                      <Feather name={"check"} color={"green"} size={24} />
                    </Pressable>
                    <Pressable
                      styleclassName="ml-2"
                      onPress={() => {
                        setIsAddingNewName(false);
                        setBigPlusVisible(true);
                      }}
                    >
                      <Feather name={"x"} size={24} />
                    </Pressable>
                  </View>
                )}
              </View>
              <View className="pb-[120px] mt-3">
                {group?.debts.length !== 0 && (
                  <Text variant={"titleLarge"} className="mb-3 font-semibold">
                    Debts
                  </Text>
                )}
                {group?.debts &&
                  group?.debts?.map((debt) => (
                    <Debt key={debt.id} debt={debt} members={group?.members} />
                  ))}
              </View>
            </View>
          </View>
        }
        headerContent={
          <View className="justify-center items-center">
            <View className="flex-row justify-between items-center w-full h-[50px] absolute top-5 left-0 bg-transparent">
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Feather name="arrow-left" size={36} color="gold" />
              </TouchableOpacity>
              <View className="flex-row">
                <Link href={`/(tabs)/group/${groupId}/stats`} className="mr-2">
                  <Feather name="pie-chart" size={36} color="gold" />
                </Link>
                <Menu
                  visible={visible}
                  onDismiss={closeMenu}
                  contentStyle={{ marginTop: 40, backgroundColor: "white" }}
                  anchor={
                    <TouchableOpacity onPress={openMenu}>
                      <Feather name="more-horizontal" size={36} color="gold" />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      closeMenu();
                      router.push({
                        pathname: "/(tabs)/group/[group_id]/update",
                        params: { group_id: groupId },
                      });
                    }}
                    title="Edit Group"
                  />
                  <Menu.Item
                    onPress={() => {
                      promptSettle();
                      closeMenu();
                    }}
                    title="Settle all expenses"
                    titleStyle={{ color: "green" }}
                  />
                  <Menu.Item
                    onPress={() => {
                      promptInvite();
                      closeMenu();
                    }}
                    title="Invite a person"
                    titleStyle={{ color: "blue" }}
                  />
                  {isOwner ? (
                    <Menu.Item
                      onPress={() => {
                        promptDelete();
                        closeMenu();
                      }}
                      title="Delete Group"
                      titleStyle={{ color: "red" }}
                    />
                  ) : (
                    <Menu.Item
                      onPress={() => {
                        promptExitGroup();
                        closeMenu();
                      }}
                      title="Exit group"
                      titleStyle={{ color: "red" }}
                    />
                  )}
                </Menu>
              </View>
            </View>
            <View />
            <Text variant="headlineMedium" className="text-white mt-6">
              {group.title}
            </Text>
          </View>
        }
      />
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => {
            setIsDialogVisible(false);
          }}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title>Are you sure to delete this group?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={isDialog2Visible}
          onDismiss={() => {
            setIsDialog2Visible(false);
          }}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title>Are you sure to settle this group?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialog2Visible(false)}>Cancel</Button>
            <Button onPress={handleSettle}>Settle</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={isGroupExiterVisible}
          onDismiss={() => {
            setIsGroupExiterVisible(false);
          }}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title>Are you sure to exit this group?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsGroupExiterVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleExitGroup}>Exit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/*Start Friend Selector for invite*/}
      <Modal
        visible={isFriendSelectorVisible}
        onDismiss={() => {
          setIsFriendSelectorVisible(false);
        }}
        contentContainerStyle={{
          width: "100%",
          paddingHorizontal: 10,
          alignSelf: "center",
          borderRadius: 20,
        }}
      >
        <View className="h-[20px] bg-white" />
        {updatedFriends &&
          updatedFriends?.map(
            ({ profile: { id, email, avatar_url }, membershipStatus }) => (
              <Friend2
                key={id}
                email={email}
                avatar_url={avatar_url}
                onInvite={() => handleInvite(id)}
                status={membershipStatus}
              />
            ),
          )}
        {!friends.length && (
          <View className="bg-white h-15 text-center pl-5">
            <Text variant={"headlineMedium"}>No friend is found</Text>
          </View>
        )}
        <TouchableOpacity
          className="absolute top-[2px] right-[10px]"
          onPress={() => {
            setIsFriendSelectorVisible(false);
          }}
        >
          <Feather name={"x"} size={28} />
        </TouchableOpacity>
      </Modal>
      {bigPlusVisible && (
        <Link href={`/(tabs)/group/${groupId}/expense/create`} asChild>
          <Pressable className="absolute bottom-2 right-4 w-[100px] h-[100px]  rounded-full bg-orange-400 justify-center items-center">
            <Feather name={"plus"} size={36} />
            <Text variant={"titleMedium"}>Expense</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
};

export default GroupDetailsScreen;
