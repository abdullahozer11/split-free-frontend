import { View, TouchableOpacity, Pressable, Alert, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DialogTitle, MenuItem, Text } from "@/src/components/Translated";
import React, { useEffect, useMemo, useState } from "react";
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
import {
  ExpenseItem,
  type ExpenseListItem,
} from "@/src/components/ExpenseItem";
import {
  TransferItem,
  type TransferListItem,
} from "@/src/components/TransferItem";
import CollapsibleHeader from "@/src/components/CollapsibleHeader";
import {
  groupElementsByDay,
  mergeActivityWithFrontier,
} from "@/src/utils/helpers";
import {
  Menu,
  Dialog,
  Portal,
  ActivityIndicator,
  Modal,
} from "react-native-paper";
import { Button, TextInput } from "@/src/components/Translated";
import { useExpenseList, useExpenseTotalThisMonth } from "@/src/api/expenses";
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
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useExpenseSubscription } from "@/src/api/expenses/subscriptions";
import { useSettings } from "@/src/providers/SettingsProvider";
import { currencyOptions } from "@/src/constants";
import QRCode from "react-native-qrcode-svg";
import { generateInvite } from "@/src/api/invites";

type FriendProfile = {
  id: string;
  email: string | null;
  avatar_url: string | null;
};

type InvitableFriend = {
  membershipStatus: string;
  profile: FriendProfile;
};

function nestedRecord<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

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
    data: expensePages,
    isError: expenseError,
    isLoading: expenseLoading,
    fetchNextPage: fetchNextExpenses,
    hasNextPage: hasMoreExpenses,
    isFetchingNextPage: isFetchingNextExpenses,
  } = useExpenseList(groupId);
  const {
    data: transferPages,
    isError: transferError,
    isLoading: transferLoading,
    fetchNextPage: fetchNextTransfers,
    hasNextPage: hasMoreTransfers,
    isFetchingNextPage: isFetchingNextTransfers,
  } = useTransferList(groupId);
  const { session } = useAuth();
  const userId = session?.user.id ?? "";
  const {
    data: friends,
    isError: friendsError,
    isLoading: friendsLoading,
  } = useFriends(userId);
  const {
    data: profile,
    isError: profileError,
    isLoading: profileLoading,
  } = useProfile(userId);
  const {
    data: pendingInvites,
    isError: pInviteError,
    isLoading: pInviteLoading,
  } = usePendingGroupInvitesForGroup(groupId);
  const {
    data: profileMember,
    isError: profileMemberError,
    isLoading: profileMemberLoading,
  } = useProfileMember(profile?.id ?? "", groupId);
  const { data: expenseTotalM, isLoading: expenseTotalMLoading } =
    useExpenseTotalThisMonth(groupId);
  const [totalBalance, setTotalBalance] = useState(0);
  const { mutate: exitGroup } = useExitGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const { mutate: settleGroup } = useSettleGroup();
  const { mutate: insertMember } = useInsertMember();
  const { mutate: assignMember } = useAssignMember();
  const { mutate: insertGroupInvitation } = useInsertGroupInvitation();
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const headerMinHeight = insets.top + 118;
  const headerMaxHeight = insets.top + 176;

  // menu related
  const [visible, setVisible] = useState(false);
  const [isAddingNewName, setIsAddingNewName] = useState(false);
  const [isFriendSelectorVisible, setIsFriendSelectorVisible] = useState(false);
  const [QRCodeVisible, setQRCodeVisible] = useState(false);
  const [isGroupExitterVisible, setIsGroupExitterVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [bigPlusVisible, setBigPlusVisible] = useState(true);
  const [newMemberName, setNewMemberName] = useState("");

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDialog2Visible, setIsDialog2Visible] = useState(false);

  const expenses = useMemo(
    () => (expensePages?.pages.flat() ?? []) as ExpenseListItem[],
    [expensePages],
  );
  const transfers = useMemo(
    () => (transferPages?.pages.flat() ?? []) as TransferListItem[],
    [transferPages],
  );
  const {
    items: visibleTransactions,
    shouldFetchExpenses,
    shouldFetchTransfers,
  } = useMemo(
    () =>
      mergeActivityWithFrontier({
        expenses,
        transfers,
        hasMoreExpenses: Boolean(hasMoreExpenses),
        hasMoreTransfers: Boolean(hasMoreTransfers),
      }),
    [expenses, transfers, hasMoreExpenses, hasMoreTransfers],
  );
  const groupedTransactions = useMemo(
    () => groupElementsByDay(visibleTransactions, settings.language),
    [visibleTransactions, settings.language],
  );

  const [updatedFriends, setUpdatedFriends] = useState<InvitableFriend[]>([]);

  useEffect(() => {
    const _balance =
      group?.members.find((mb) => {
        const memberProfile = nestedRecord(mb.profile);
        return memberProfile && memberProfile.id === profile?.id;
      })?.total_balance ?? 0;
    setTotalBalance(_balance);
  }, [group, profile?.id]);

  useEffect(() => {
    const memberIds =
      group?.members?.map((member) => nestedRecord(member.profile)?.id) || [];

    const pendingInviteIds = pendingInvites?.map(
      (invite) => nestedRecord(invite.receiver_profile)?.id,
    );

    const newUpdatedFriends =
      friends?.flatMap((friend) => {
        const friendProfile = nestedRecord(friend.profile);
        if (!friendProfile) {
          return [];
        }
        const friendId = friendProfile.id;
        const membershipStatus = memberIds?.includes(friendId)
          ? "member"
          : pendingInviteIds?.includes(friendId)
            ? "invited"
            : "available";
        return [{ profile: friendProfile, membershipStatus }];
      }) ?? [];

    setUpdatedFriends(newUpdatedFriends);
  }, [friends, pendingInvites, group]);

  useExpenseSubscription(groupId);

  if (
    groupLoading ||
    expenseLoading ||
    transferLoading ||
    profileLoading ||
    friendsLoading ||
    profileMemberLoading ||
    pInviteLoading ||
    expenseTotalMLoading
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

  if (!group) {
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
        queryClient.setQueryData<InfiniteData<ExpenseListItem[]>>(
          ["expenses", group.id],
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((expense) => ({ ...expense, settled: true })),
              ),
            };
          },
        );

        setIsDialog2Visible(false);
        await queryClient.invalidateQueries({ queryKey: ["groups"] });
        await queryClient.invalidateQueries({ queryKey: ["debts"] });
        await queryClient.invalidateQueries({
          queryKey: ["expenses", group.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ["transfers", group.id],
        });
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
        await queryClient.invalidateQueries({ queryKey: ["groups"] });
      },
      onError: (error) => {
        console.error("Server error:", error);
        Alert.alert("Error", "Server error.");
      },
    });
  };

  const promptInvite = async () => {
    try {
      const link = await generateInvite(groupId);
      setInviteLink(link);
      setQRCodeVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to generate invite link.");
    }
  };

  const promptExitGroup = () => {
    setIsGroupExitterVisible(true);
  };

  const handleExitGroup = () => {
    if (!userId) {
      return;
    }
    exitGroup(
      {
        _profile_id: userId,
        _group_id: groupId,
      },
      {
        onSuccess: async () => {
          // console.log("Group exited successfully");
          navigation.goBack();
          await queryClient.invalidateQueries({ queryKey: ["groups"] });
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

  const handleInvite = (id: string) => {
    if (!userId) {
      return;
    }
    insertGroupInvitation(
      {
        sender: userId,
        receiver: id,
        group_id: groupId,
        group_name: group.title,
      },
      {
        onSuccess: () => {
          // console.log('Successfully inserted group invitation');
          setIsFriendSelectorVisible(false);
          queryClient.invalidateQueries({
            queryKey: ["group_invites_for_group"],
          });
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const handleAssign = (memberId: number) => {
    assignMember(
      {
        _member_id: memberId,
        _group_id: groupId,
      },
      {
        onSuccess: async () => {
          // console.log('Member assign is dealt with success');
          await queryClient.invalidateQueries({
            queryKey: ["members", groupId],
          });
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
          await queryClient.invalidateQueries({
            queryKey: ["members", groupId],
          });
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const isOwner = session?.user.id === group.owner;

  const currencyOption = currencyOptions.find(
    (opt) => opt.value === group?.currency,
  );
  const currency_label = currencyOption?.label || "$";

  return (
    <View className="bg-[#F6F6F6FF] flex-1">
      <CollapsibleHeader
        H_MIN_HEIGHT={headerMinHeight}
        H_MAX_HEIGHT={headerMaxHeight}
        content={
          <View className="flex-1">
            {/*First Section*/}
            <View className="p-5 flex-1">
              <View className="flex-row mx-4 pb-7">
                <View className={"flex-1"}>
                  <View className="flex-1">
                    <Text variant="titleLarge">Group spent</Text>
                    <Text variant="headlineMedium" className="font-bold">
                      {group?.expense_total || 0}
                      {currency_label}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="titleMedium">This month</Text>
                    <Text variant="headlineSmall" className="">
                      {expenseTotalM || 0}
                      {currency_label}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text variant="titleLarge">
                    {totalBalance >= 0 ? "Total Receivable" : "Total Debt"}
                  </Text>
                  <Text
                    variant="headlineMedium"
                    className={`font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {Math.abs(totalBalance || 0)}
                    {currency_label}
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
                      {groupedTransactions[item].map((transaction) =>
                        transaction.type === "expense" ? (
                          <ExpenseItem
                            key={`expense-${transaction.id}`}
                            expense={transaction}
                            currency_label={currency_label}
                          />
                        ) : (
                          <TransferItem
                            key={`transfer-${transaction.id}`}
                            transfer={transaction}
                            members={group?.members}
                            currentUserId={session?.user.id}
                            currency_label={currency_label}
                          />
                        ),
                      )}
                    </View>
                  ))}
                  {(shouldFetchExpenses || shouldFetchTransfers) && (
                    <Button
                      onPress={() => {
                        if (shouldFetchExpenses) fetchNextExpenses();
                        if (shouldFetchTransfers) fetchNextTransfers();
                      }}
                      disabled={
                        isFetchingNextExpenses || isFetchingNextTransfers
                      }
                    >
                      {isFetchingNextExpenses || isFetchingNextTransfers
                        ? "Loading..."
                        : "Load More"}
                    </Button>
                  )}
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
                      className="ml-2"
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
          <View className="flex-1 px-4" style={{ paddingTop: insets.top }}>
            <View className="flex-row justify-between items-center w-full h-[50px]">
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
                className="w-[50px] justify-center items-start"
              >
                <Feather name="arrow-left" size={36} color="gold" />
              </TouchableOpacity>

              <View className="flex-row w-[100px] justify-end">
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
                  <MenuItem
                    onPress={() => {
                      closeMenu();
                      router.push({
                        pathname: "/(tabs)/group/[group_id]/update",
                        params: { group_id: groupId },
                      });
                    }}
                    title="Edit group"
                  />
                  <MenuItem
                    onPress={() => {
                      promptSettle();
                      closeMenu();
                    }}
                    title="Settle all expenses"
                    titleStyle={{ color: "green" }}
                  />
                  <MenuItem
                    onPress={() => {
                      promptInvite();
                      closeMenu();
                    }}
                    title="Invite a person"
                    titleStyle={{ color: "blue" }}
                  />
                  {isOwner ? (
                    <MenuItem
                      onPress={() => {
                        promptDelete();
                        closeMenu();
                      }}
                      title="Delete Group"
                      titleStyle={{ color: "red" }}
                    />
                  ) : (
                    <MenuItem
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

            <View className="flex-1 justify-end px-2 pb-3">
              <Text
                variant={
                  group.title.length > 20 ? "headlineSmall" : "headlineMedium"
                }
                className="text-center font-semibold"
                style={{ color: "#FFFFFF" }}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                ellipsizeMode="tail"
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
          <DialogTitle>Are you sure to delete this group?</DialogTitle>
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
          <DialogTitle>Are you sure to settle this group?</DialogTitle>
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
          <DialogTitle>Are you sure to exit this group?</DialogTitle>
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
        {!friends?.length && (
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
      {/* Invite QR Modal */}
      <Modal
        visible={QRCodeVisible}
        onDismiss={() => setQRCodeVisible(false)}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 20,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text variant="titleLarge">Invite to Group</Text>
        <View className="my-5 items-center">
          {inviteLink ? (
            <QRCode value={inviteLink} size={200} />
          ) : (
            <ActivityIndicator />
          )}
        </View>
        <Text selectable className="mb-5 text-center">
          {inviteLink}
        </Text>
        <Button
          onPress={async () => {
            try {
              await Share.share({ message: inviteLink });
            } catch (error) {
              Alert.alert("Error", "Failed to share link.");
            }
          }}
        >
          Share Link
        </Button>
        <Button onPress={() => setQRCodeVisible(false)}>Close</Button>
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
