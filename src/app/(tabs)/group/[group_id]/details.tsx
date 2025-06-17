import { View, TouchableOpacity, Pressable, Alert } from "react-native";
import React, {useEffect, useMemo, useState} from "react";
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
import { TransferItem } from "@/src/components/TransferItem";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {groupElementsByDay, inThisMonth} from "@/src/utils/helpers";
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
import { useTransferList } from "@/src/api/transfers";
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
  const {
    data: transfers,
    isError: transferError,
    isLoading: transferLoading,
  } = useTransferList(groupId);
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
  const [isGroupExitterVisible, setIsGroupExitterVisible] = useState(false);
  const [bigPlusVisible, setBigPlusVisible] = useState(true);
  const [newMemberName, setNewMemberName] = useState("");

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDialog2Visible, setIsDialog2Visible] = useState(false);

  // Merge and group expenses and transfers
  const groupedTransactions = useMemo(() => {
    const allTransactions = [];

    // Add expenses with type identifier
    if (expenses) {
      expenses.forEach(expense => {
        allTransactions.push({
          ...expense,
          type: 'expense',
          date: expense.created_at
        });
      });
    }

    // Add transfers with type identifier
    if (transfers) {
      transfers.forEach(transfer => {
        allTransactions.push({
          ...transfer,
          type: 'transfer',
          date: transfer.created_at
        });
      });
    }

    // Sort by created_at (most recent first) - this will mix expenses and transfers
    allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Group by day using created_at
    return groupElementsByDay(allTransactions);
  }, [expenses, transfers]);

  const [updatedFriends, setUpdatedFriends] = useState([]);

  useEffect(() => {
    const _balance =
      group?.members
        .find((mb) => mb.profile && mb.profile.id === profile?.id)
        ?.total_balance?.toFixed(2) || null;
    setTotalBalance(_balance);
  }, [group, profile?.id]);

  useEffect(() => {
    // Create a list of member ids
    const memberIds = group?.members?.map((member) => member.profile?.id) || [];

    // Create a list of pending invite ids
    const pendingInviteIds = pendingInvites?.map(
      (invite) => invite?.receiver_profile?.id,
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

  const expense_totalM = useMemo(() => {
    if (!expenses?.length) return 0;
    const expensesM = expenses.filter((ex) => inThisMonth(ex?.date));
    return expensesM.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2);
  }, [expenses]);

  useExpenseSubscription(groupId);

  if (
    groupLoading ||
    expenseLoading ||
    transferLoading ||
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
    transferError ||
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
        // Locally update settled status for all expenses in this group
        queryClient.setQueryData(["expenses", group.id], (oldData) =>
          oldData.map(expense => ({...expense, settled: true}))
        );

        setIsDialog2Visible(false);
        await queryClient.invalidateQueries(["groups"]);
        await queryClient.invalidateQueries(["debts"]);
        await queryClient.invalidateQueries(["expenses", group.id]);
        await queryClient.invalidateQueries(["transfers", group.id]);
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
    setIsGroupExitterVisible(true);
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
                <View className={"flex-1"}>
                  <View className="flex-1">
                    <Text variant="titleLarge">Group spent:</Text>
                    <Text variant="headlineMedium" className="font-bold">
                      {group?.expense_total || 0}€
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="titleMedium">This month:</Text>
                    <Text variant="headlineSmall" className="">
                      {expense_totalM || 0}€
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text variant="titleLarge">
                    {totalBalance >= 0 ? "Total Receivable:" : "Total Debt:"}
                  </Text>
                  <Text
                    variant="headlineMedium"
                    className={`font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {Math.abs(totalBalance || 0)}€
                  </Text>
                </View>
                {/*last settlement date*/}
              </View>
              <View>
                <Text variant={"titleLarge"} className="mb-4 font-semibold">
                  Recent Activity
                </Text>
                <View>
                  {Object.keys(groupedTransactions).map((item) => (
                    <View className="my-4 gap-y-5" key={item}>
                      <Text variant={"titleMedium"}>{item}</Text>
                      {groupedTransactions[item].map((transaction) => (
                        transaction.type === 'expense' ? (
                          <ExpenseItem key={`expense-${transaction.id}`} expense={transaction} />
                        ) : (
                          <TransferItem
                            key={`transfer-${transaction.id}`}
                            transfer={transaction}
                            members={group?.members}
                            currentUserId={session?.user.id}
                          />
                        )
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
          <View className="justify-center items-center px-4">
            {/* Navigation and Menu Row */}
            <View className="flex-row justify-between items-center w-full h-[50px] mt-5">
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
                className="w-[50px] justify-center items-start"
              >
                <Feather name="arrow-left" size={36} color="gold"/>
              </TouchableOpacity>

              <View className="flex-row w-[100px] justify-end">
                <Link href={`/(tabs)/group/${groupId}/stats`} className="mr-2">
                  <Feather name="pie-chart" size={36} color="gold"/>
                </Link>
                <Menu
                  visible={visible}
                  onDismiss={closeMenu}
                  contentStyle={{marginTop: 40, backgroundColor: "white"}}
                  anchor={
                    <TouchableOpacity onPress={openMenu}>
                      <Feather name="more-horizontal" size={36} color="gold"/>
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      closeMenu();
                      router.push({
                        pathname: "/(tabs)/group/[group_id]/update",
                        params: {group_id: groupId},
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
                    titleStyle={{color: "green"}}
                  />
                  <Menu.Item
                    onPress={() => {
                      promptInvite();
                      closeMenu();
                    }}
                    title="Invite a person"
                    titleStyle={{color: "blue"}}
                  />
                  {isOwner ? (
                    <Menu.Item
                      onPress={() => {
                        promptDelete();
                        closeMenu();
                      }}
                      title="Delete Group"
                      titleStyle={{color: "red"}}
                    />
                  ) : (
                    <Menu.Item
                      onPress={() => {
                        promptExitGroup();
                        closeMenu();
                      }}
                      title="Exit group"
                      titleStyle={{color: "red"}}
                    />
                  )}
                </Menu>
              </View>
            </View>

            {/* Group Title - Separate row with proper spacing */}
            <View className="w-full px-4 mt-4">
              <Text
                variant={group.title.length > 20 ? "headlineSmall" : "headlineMedium"}
                className="text-white text-center"
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {group.title}
              </Text>
            </View>
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
          visible={isGroupExitterVisible}
          onDismiss={() => {
            setIsGroupExitterVisible(false);
          }}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title>Are you sure to exit this group?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsGroupExitterVisible(false)}>
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
        <View className="absolute bottom-2 right-4 flex-row gap-2">
          <Link href={`/(tabs)/group/${groupId}/expense/create`} asChild>
            <Pressable className="w-[100px] h-[100px] rounded-full bg-orange-400 justify-center items-center">
              <Feather name={"plus"} size={36} />
              <Text variant={"titleMedium"}>Expense</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </View>
  );
};

export default GroupDetailsScreen;
