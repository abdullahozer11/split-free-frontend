import { View, TouchableOpacity, Pressable, Share } from "react-native";
import { DialogTitle, MenuItem, Text, useTranslatedAlert } from "@/src/components/Translated";
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
import {groupElementsByDay} from "@/src/utils/helpers";
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
import { Debt, Member } from "@/src/components/Person";
import {
  useAssignMember,
  useProfile,
} from "@/src/api/profiles";
import { useAuth } from "@/src/providers/AuthProvider";
import { useInsertMember, useProfileMember } from "@/src/api/members";
import { useQueryClient } from "@tanstack/react-query";
import { useExpenseSubscription } from "@/src/api/expenses/subscriptions";
import { useSettings } from "@/src/providers/SettingsProvider.js";
import { currencyOptions } from "@/src/constants/Currencies";
import QRCode from 'react-native-qrcode-svg';
import { generateInvite } from "@/src/api/invites";
import {useMemberSubscription} from "@/src/api/members/subscriptions";


const GroupDetailsScreen = () => {
  console.log('🚀 GroupDetailsScreen: Component rendering');

  const { alert } = useTranslatedAlert();
  const { group_id: idString } = useLocalSearchParams();

  console.log('🔍 Debug - idString:', idString);

  const groupId = parseInt(
    typeof idString === "string" ? idString : idString?.[0],
  );

  console.log('🔍 Debug - groupId:', groupId);

  if (isNaN(groupId)) {
    console.error('❌ Error: Invalid groupId', { idString, groupId });
    return <Text variant={"displayLarge"}>Invalid Group ID</Text>;
  }

  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: group,
    isError: groupError,
    isLoading: groupLoading,
  } = useGroup(groupId);

  console.log('🔍 Debug - group data:', {
    group: group ? 'exists' : 'null/undefined',
    groupError,
    groupLoading,
    groupKeys: group ? Object.keys(group) : 'N/A'
  });

  const {
    data: expensePages,
    isError: expenseError,
    isLoading: expenseLoading,
    fetchNextPage: fetchNextExpenses,
    hasNextPage: hasMoreExpenses,
    isFetchingNextPage: isFetchingNextExpenses,
  } = useExpenseList(groupId);

  console.log('🔍 Debug - expensePages:', {
    expensePages: expensePages ? 'exists' : 'null/undefined',
    expenseError,
    expenseLoading,
    pagesCount: expensePages?.pages?.length || 0
  });

  const {
    data: transferPages,
    isError: transferError,
    isLoading: transferLoading,
    fetchNextPage: fetchNextTransfers,
    hasNextPage: hasMoreTransfers,
    isFetchingNextPage: isFetchingNextTransfers,
  } = useTransferList(groupId);

  console.log('🔍 Debug - transferPages:', {
    transferPages: transferPages ? 'exists' : 'null/undefined',
    transferError,
    transferLoading,
    pagesCount: transferPages?.pages?.length || 0
  });

  const { session } = useAuth();

  console.log('🔍 Debug - session:', {
    session: session ? 'exists' : 'null/undefined',
    userId: session?.user?.id || 'N/A'
  });

  const {
    data: profile,
    isError: profileError,
    isLoading: profileLoading,
  } = useProfile(session?.user?.id);

  console.log('🔍 Debug - profile:', {
    profile: profile ? 'exists' : 'null/undefined',
    profileError,
    profileLoading,
    profileId: profile?.id || 'N/A'
  });

  const {
    data: profileMember,
    isError: profileMemberError,
    isLoading: profileMemberLoading,
  } = useProfileMember(profile?.id, groupId);

  console.log('🔍 Debug - profileMember:', {
    profileMember: profileMember ? 'exists' : 'null/undefined',
    profileMemberError,
    profileMemberLoading
  });

  const {
    data: expenseTotalM,
    isLoading: expenseTotalMLoading,
  } = useExpenseTotalThisMonth(groupId);

  const [totalBalance, setTotalBalance] = useState(0);
  const { mutate: exitGroup } = useExitGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const { mutate: settleGroup } = useSettleGroup();
  const { mutate: insertMember } = useInsertMember();
  const { mutate: assignMember } = useAssignMember();
  const { settings } = useSettings();

  console.log('🔍 Debug - settings:', {
    settings: settings ? 'exists' : 'null/undefined',
    language: settings?.language || 'N/A'
  });

  // menu related
  const [visible, setVisible] = useState(false);
  const [isAddingNewName, setIsAddingNewName] = useState(false);
  const [QRCodeVisible, setQRCodeVisible] = useState(false);
  const [isGroupExiterVisible, setIsGroupExiterVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [bigPlusVisible, setBigPlusVisible] = useState(true);
  const [newMemberName, setNewMemberName] = useState("");

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDialog2Visible, setIsDialog2Visible] = useState(false);

  // Merge and group expenses and transfers
  const groupedTransactions = useMemo(() => {
    console.log('🔄 Computing groupedTransactions...');

    try {
      const allTransactions = [];

      // Add expenses with type identifier - with null checks
      if (expensePages?.pages) {
        console.log('📊 Processing expenses:', expensePages.pages.length, 'pages');
        expensePages.pages.flat().forEach((expense, index) => {
          if (expense) {
            allTransactions.push({
              ...expense,
              type: "expense",
              date: expense?.created_at,
            });
          } else {
            console.warn('⚠️ Null expense at index:', index);
          }
        });
      } else {
        console.log('📊 No expense pages available');
      }

      // Add transfers with type identifier - with null checks
      if (transferPages?.pages) {
        console.log('💸 Processing transfers:', transferPages.pages.length, 'pages');
        transferPages.pages.flat().forEach((transfer, index) => {
          if (transfer) {
            allTransactions.push({
              ...transfer,
              type: "transfer",
              date: transfer.created_at,
            });
          } else {
            console.warn('⚠️ Null transfer at index:', index);
          }
        });
      } else {
        console.log('💸 No transfer pages available');
      }

      console.log('📋 Total transactions:', allTransactions.length);

      // Sort by created_at (most recent first) - this will mix expenses and transfers
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });

      // Group by day using created_at - with null checks
      if (!settings?.language) {
        console.warn('⚠️ Settings language not available, using default');
        return groupElementsByDay(allTransactions, 'en');
      }

      const grouped = groupElementsByDay(allTransactions, settings.language);
      console.log('📅 Grouped transactions keys:', Object.keys(grouped || {}));

      return grouped;
    } catch (error) {
      console.error('❌ Error in groupedTransactions:', error);
      return {};
    }
  }, [expensePages, transferPages, settings?.language]);

  useEffect(() => {
    console.log('🔄 Computing totalBalance...');

    try {
      if (!group?.members || !Array.isArray(group.members)) {
        console.log('⚠️ Group members not available or not array');
        setTotalBalance(0);
        return;
      }

      if (!profile?.id) {
        console.log('⚠️ Profile ID not available');
        setTotalBalance(0);
        return;
      }

      console.log('👥 Searching in', group.members.length, 'members for profile ID:', profile.id);

      const memberBalance = group.members
        .find((mb) => mb?.profile && mb.profile.id === profile.id)
        ?.total_balance;

      console.log('💰 Found member balance:', memberBalance);

      const _balance = memberBalance ? memberBalance.toFixed(2) : 0;
      setTotalBalance(_balance);
    } catch (error) {
      console.error('❌ Error computing totalBalance:', error);
      setTotalBalance(0);
    }
  }, [group, profile?.id]);

  useExpenseSubscription(groupId);
  useMemberSubscription(groupId);

  // Enhanced loading check with logging
  const isLoading = groupLoading || expenseLoading || transferLoading || profileLoading || profileMemberLoading || expenseTotalMLoading;

  if (isLoading) {
    console.log('⏳ Still loading:', {
      groupLoading,
      expenseLoading,
      transferLoading,
      profileLoading,
      profileMemberLoading,
      expenseTotalMLoading
    });
    return <ActivityIndicator />;
  }

  // Enhanced error check with logging
  const hasError = groupError || expenseError || transferError || profileError || profileMemberError;

  if (hasError) {
    console.error('❌ Errors detected:', {
      groupError,
      expenseError,
      transferError,
      profileError,
      profileMemberError
    });
    return <Text variant={"displayLarge"}>Failed to fetch data</Text>;
  }

  const promptDelete = () => {
    console.log('🗑️ Prompting delete');
    setIsDialogVisible(true);
  };

  const promptSettle = () => {
    console.log('💰 Prompting settle');
    setIsDialog2Visible(true);
  };

  const handleSettle = async () => {
    console.log('💰 Handling settle for group:', group?.id);

    if (!group?.id) {
      console.error('❌ No group ID for settle');
      alert("Error", "Group not found.");
      return;
    }

    try {
      await settleGroup(group.id, {
        onSuccess: async () => {
          console.log('✅ Settle successful');
          // Locally update settled status for all expenses in this group
          queryClient.setQueryData(["expenses", group.id], (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((expense) => ({ ...expense, settled: true })),
              ),
            };
          });

          setIsDialog2Visible(false);
          await queryClient.invalidateQueries(["groups"]);
          await queryClient.invalidateQueries(["debts"]);
          await queryClient.invalidateQueries(["expenses", group.id]);
          await queryClient.invalidateQueries(["transfers", group.id]);
        },
        onError: (error) => {
          console.error('❌ Settle error:', error);
          alert("Error", "Server error.");
        },
      });
    } catch (error) {
      console.error('❌ Settle exception:', error);
      alert("Error", "Unexpected error occurred.");
    }
  };

  const handleDelete = async () => {
    console.log('🗑️ Handling delete for group:', group?.id);

    if (!group?.id) {
      console.error('❌ No group ID for delete');
      alert("Error", "Group not found.");
      return;
    }

    try {
      await deleteGroup(group.id, {
        onSuccess: async () => {
          console.log('✅ Delete successful');
          navigation.goBack();
          await queryClient.invalidateQueries(["groups"]);
        },
        onError: (error) => {
          console.error('❌ Delete error:', error);
          alert("Error", "Server error.");
        },
      });
    } catch (error) {
      console.error('❌ Delete exception:', error);
      alert("Error", "Unexpected error occurred.");
    }
  };

  const promptInvite = async () => {
    console.log('📧 Generating invite for group:', groupId);

    try {
      const link = await generateInvite(groupId);
      console.log('✅ Invite generated:', link ? 'success' : 'empty');
      setInviteLink(link);
      setQRCodeVisible(true);
    } catch (error) {
      console.error('❌ Invite generation error:', error);
      alert("Error", "Failed to generate invite link.");
    }
  };

  const promptExitGroup = () => {
    console.log('🚪 Prompting exit group');
    setIsGroupExiterVisible(true);
  };

  const handleExitGroup = () => {
    console.log('🚪 Handling exit group');

    if (!session?.user?.id || !groupId) {
      console.error('❌ Missing session or group ID for exit');
      alert("Error", "Unable to exit group.");
      return;
    }

    exitGroup(
      {
        _profile_id: session.user.id,
        _group_id: groupId,
      },
      {
        onSuccess: async () => {
          console.log('✅ Exit successful');
          navigation.goBack();
          await queryClient.invalidateQueries(["groups"]);
        },
        onError: (error) => {
          console.error('❌ Exit error:', error);
          alert(
            "Error",
            "There was an error exiting the group. Please try again.",
          );
        },
      },
    );
  };

  const handleAssign = (memberId) => {
    console.log('👤 Handling assign member:', memberId);

    if (!memberId || !groupId) {
      console.error('❌ Missing member ID or group ID for assign');
      alert("Error", "Invalid member or group.");
      return;
    }

    assignMember(
      {
        _member_id: memberId,
        _group_id: groupId,
      },
      {
        onSuccess: async () => {
          console.log('✅ Assign successful');
          await queryClient.invalidateQueries(["members", groupId]);
        },
        onError: (error) => {
          console.error('❌ Assign error:', error);
          alert("Error", "Server error.");
        },
      },
    );
  };

  const handleNewMember = () => {
    console.log('👤 Handling new member:', newMemberName);

    const trimmedName = newMemberName.trim();
    if (!trimmedName) {
      console.log('⚠️ Empty member name');
      alert("Error", "Name cannot be empty.");
      return;
    }

    if (!group?.members || !Array.isArray(group.members)) {
      console.error('❌ Group members not available for name check');
      alert("Error", "Unable to validate member name.");
      return;
    }

    const existingNames = group.members
      .filter(m => m?.name) // Filter out null/undefined names
      .map(m => m.name.toLowerCase().trim());

    if (existingNames.includes(trimmedName.toLowerCase())) {
      console.log('⚠️ Member name already exists');
      alert("Error", "Name already exists in the group.");
      return;
    }

    insertMember(
      {
        name: trimmedName,
        group_id: groupId,
      },
      {
        onSuccess: async () => {
          console.log('✅ New member added successfully');
          setNewMemberName("");
          setIsAddingNewName(false);
          setBigPlusVisible(true);
          await queryClient.invalidateQueries(["members", groupId]);
        },
        onError: (error) => {
          console.error('❌ New member error:', error);
          alert("Error", "Server error.");
        },
      },
    );
  };

  // Safe property access with logging
  const isOwner = session?.user?.id === group?.owner;
  console.log('👑 Owner check:', { isOwner, sessionUserId: session?.user?.id, groupOwner: group?.owner });

  const currencyOption = currencyOptions?.find(opt => opt?.value === group?.currency);
  const currency_label = currencyOption?.label || '$';

  console.log('💱 Currency:', { currency: group?.currency, label: currency_label });

  // Final safety check before render
  if (!group) {
    console.error('❌ Group data is null/undefined at render time');
    return <Text variant={"displayLarge"}>Group not found</Text>;
  }

  console.log('✅ Rendering component with valid data');

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
                    <Text variant="titleLarge">Group spent</Text>
                    <Text variant="headlineMedium" className="font-bold">
                      {group?.expense_total || 0}{currency_label}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="titleMedium">This Month</Text>
                    <Text variant="headlineSmall" className="">
                      {expenseTotalM || 0}{currency_label}
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
                    {Math.abs(totalBalance || 0)}{currency_label}
                  </Text>
                </View>
                {/*last settlement date*/}
              </View>
              <View>
                <Text variant={"titleLarge"} className="mb-4 font-semibold">
                  Recent Activity
                </Text>
                <View>
                  {Object.keys(groupedTransactions || {}).map((item) => (
                    <View className="my-4 gap-y-5" key={item}>
                      <Text variant={"titleMedium"}>{item}</Text>
                      {(groupedTransactions[item] || []).map((transaction) => (
                        transaction?.type === 'expense' ? (
                          <ExpenseItem key={`expense-${transaction.id}`} expense={transaction} currency_label={currency_label}/>
                        ) : (
                          <TransferItem
                            key={`transfer-${transaction.id}`}
                            transfer={transaction}
                            members={group?.members || []}
                            currentUserId={session?.user?.id}
                            currency_label={currency_label}
                          />
                        )
                      ))}
                    </View>
                  ))}
                  {(hasMoreExpenses || hasMoreTransfers) && (
                    <Button
                      onPress={() => {
                        if (hasMoreExpenses) fetchNextExpenses();
                        if (hasMoreTransfers) fetchNextTransfers();
                      }}
                      disabled={isFetchingNextExpenses || isFetchingNextTransfers}
                    >
                      {isFetchingNextExpenses || isFetchingNextTransfers ? "Loading..." : "Load More"}
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
                {group?.members && Array.isArray(group.members) &&
                  group.members.map((member) => (
                    member ? (
                      <Member
                        key={member.name || member.id}
                        member={member}
                        myOwnMember={member.id === profileMember?.id}
                        assignable={!profileMember && !member.profile}
                        onAssign={() => {
                          handleAssign(member.id);
                        }}
                      />
                    ) : null
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
                {group?.debts && Array.isArray(group.debts) && group.debts.length !== 0 && (
                  <Text variant={"titleLarge"} className="mb-3 font-semibold">
                    Debts
                  </Text>
                )}
                {group?.debts && Array.isArray(group.debts) &&
                  group.debts.map((debt) => (
                    debt ? (
                      <Debt key={debt.id} debt={debt} members={group?.members || []} />
                    ) : null
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
                  <MenuItem
                    onPress={() => {
                      closeMenu();
                      router.push({
                        pathname: "/(tabs)/group/[group_id]/update",
                        params: {group_id: groupId},
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
                    titleStyle={{color: "green"}}
                  />
                  <MenuItem
                    onPress={() => {
                      promptInvite();
                      closeMenu();
                    }}
                    title="Invite a person"
                    titleStyle={{color: "blue"}}
                  />
                  {isOwner ? (
                    <MenuItem
                      onPress={() => {
                        promptDelete();
                        closeMenu();
                      }}
                      title="Delete Group"
                      titleStyle={{color: "red"}}
                    />
                  ) : (
                    <MenuItem
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
                variant={(group?.title?.length && group.title.length > 20) ? "headlineSmall" : "headlineMedium"}
                className="text-white text-center"
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {group?.title || 'Unnamed Group'}
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
          visible={isGroupExiterVisible}
          onDismiss={() => {
            setIsGroupExiterVisible(false);
          }}
        >
          <Dialog.Icon icon="alert" />
          <DialogTitle>Are you sure to exit this group?</DialogTitle>
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
      {/* Invite QR Modal */}
      <Modal
        visible={QRCodeVisible}
        onDismiss={() => setQRCodeVisible(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          margin: 20,
          borderRadius: 10,
          alignItems: 'center',
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
        <Text selectable className="mb-5 text-center">{inviteLink}</Text>
        <Button
          onPress={async () => {
            try {
              await Share.share({ message: inviteLink });
            } catch (error) {
              console.error('❌ Share error:', error);
              alert("Error", "Failed to share link.");
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
