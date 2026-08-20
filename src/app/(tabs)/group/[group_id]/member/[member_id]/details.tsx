import { View, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  TextInput,
  Text,
  DialogTitle,
} from "@/src/components/Translated";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import CollapsibleHeader from "@/src/components/CollapsibleHeader";
import { ActivityIndicator, Card, Dialog, Portal } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { useGroup } from "@/src/api/groups";
import {
  useDeleteMember,
  useMember,
  useProfileMember,
  useUpdateMemberName,
} from "@/src/api/members";
import { useAuth } from "@/src/providers/AuthProvider";
import { useDebt } from "@/src/api/debts";
import { useQueryClient } from "@tanstack/react-query";
import { currencyOptions } from "@/src/constants";

function nestedRecord<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

const MemberDetailsScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { member_id: memberIdString } = useLocalSearchParams();
  const memberId = parseInt(
    typeof memberIdString === "string" ? memberIdString : memberIdString[0],
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [name, setName] = useState("");

  const { session } = useAuth();
  const userId = session?.user.id ?? "";

  const {
    data: member,
    isError: memberError,
    isLoading: memberLoading,
  } = useMember(memberId);
  const groupId = member?.group_id ?? 0;
  const {
    data: profileMember,
    isError: profileMemberError,
    isLoading: profileMemberLoading,
  } = useProfileMember(userId, groupId);
  const {
    data: debt,
    isError: debtError,
    isLoading: debtLoading,
  } = useDebt(memberId, profileMember?.id ?? 0);
  const {
    data: group,
    isError: groupError,
    isLoading: groupLoading,
  } = useGroup(groupId);

  const { mutate: updateMemberName } = useUpdateMemberName();
  const { mutate: deleteMember } = useDeleteMember();

  useEffect(() => {
    setName(member?.name ?? "");
  }, [member]);

  if (memberLoading || profileMemberLoading || debtLoading || groupLoading) {
    return <ActivityIndicator />;
  }

  if (memberError || profileMemberError || debtError || groupError || !member) {
    return <Text>Failed to fetch data</Text>;
  }

  const memberProfile = nestedRecord(member.profile);
  const memberGroup = nestedRecord(member.group);
  const ownMember = member.id === profileMember?.id;
  const isEditable = !memberProfile || ownMember;

  const handleNameSubmit = () => {
    updateMemberName(
      {
        name,
        member_id: member.id,
      },
      {
        onSuccess: async () => {
          console.log("Member name update is dealt with success");
          setIsEditingName(false);
          await queryClient.invalidateQueries({
            queryKey: ["member", memberId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["members", member.group_id],
          });
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMember(member.id, {
      onSuccess: async () => {
        navigation.goBack();
        await queryClient.invalidateQueries({
          queryKey: ["members", member.group_id],
        });
        await queryClient.invalidateQueries({ queryKey: ["expense"] });
      },
      onError: (error) => {
        console.error("Server error:", error);
        Alert.alert("Error", "Server error.");
      },
    });
  };

  const currencyOption = currencyOptions.find(
    (opt) => opt.value === group?.currency,
  );
  const currency_label = currencyOption?.label || "$";
  const debtAmount = debt?.amount ?? 0;

  return (
    <SafeAreaView className="flex-1">
      <CollapsibleHeader
        H_MAX_HEIGHT={200}
        H_MIN_HEIGHT={52}
        content={
          <View className="justify-center items-center flex-1 mt-5">
            <Card>
              <Card.Content>
                <View className="justify-center items-center bg-transparent">
                  <Image
                    source={
                      memberProfile?.avatar_url
                        ? { uri: memberProfile.avatar_url }
                        : require("@/assets/images/blank-profile.png")
                    }
                    className="w-[160px] h-[160px] rounded-full"
                  />
                </View>
                <Text>
                  <Text>Group</Text>: {memberGroup?.title}
                </Text>
                {!isEditingName && (
                  <View style={{ gap: 5 }} className="flex-row">
                    <Text>
                      <Text>Name</Text>: {member.name}
                    </Text>
                    {isEditable && (
                      <TouchableOpacity
                        onPress={() => {
                          setIsEditingName(true);
                        }}
                      >
                        <Feather name={"edit"} size={20} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {isEditingName && (
                  <View className="flex-row items-center">
                    <TextInput
                      placeholder="Enter query key"
                      onChangeText={setName}
                      value={name}
                      className="flex-1 bg-beige-300"
                    />
                    <Button onPress={handleNameSubmit}>
                      <Feather name={"check"} size={26} />
                    </Button>
                  </View>
                )}
                <Text>
                  <Text>Attached to Profile</Text>:{" "}
                  {memberProfile?.email || "None"}
                </Text>
                <Text>
                  <Text>Role</Text>: <Text>{member.role}</Text>{" "}
                  {member.role === "owner" ? (
                    <Feather name={"award"} size={18} color={"silver"} />
                  ) : null}
                </Text>
                <Text>
                  <Text>Total Balance</Text>:{" "}
                  <Text
                    style={{
                      color: member.total_balance >= 0 ? "green" : "red",
                    }}
                  >
                    {currency_label}
                    {member.total_balance.toFixed(2)}
                  </Text>
                </Text>
                {!ownMember &&
                  debt &&
                  (debtAmount >= 0 ? (
                    <Text>
                      <Text>Owes you</Text>: {currency_label}
                      {debtAmount}
                    </Text>
                  ) : (
                    <Text>
                      <Text>You owe</Text>: {currency_label}
                      {debtAmount}
                    </Text>
                  ))}
              </Card.Content>
            </Card>
          </View>
        }
        headerContent={
          <View className="justify-center items-center flex-1">
            <View className="flex-row justify-between items-center w-full h-[50px] absolute top-4 left-0 bg-transparent">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={36} color="white" />
              </TouchableOpacity>
              {isEditable && !ownMember && (
                <TouchableOpacity onPress={() => setIsDialogVisible(true)}>
                  <Feather name={"trash"} size={24} color={"red"} />
                </TouchableOpacity>
              )}
            </View>
            <View className="justify-between items-center">
              <Text
                variant={"displaySmall"}
                className="mb-2 max-w-[70%]"
                style={{ color: "#FFFFFF" }}
              >
                {member.name} {member.id === profileMember?.id && "(me)"}
              </Text>
              <Text style={{ color: "#FFFFFF" }}>
                <Text style={{ color: "#FFFFFF" }}>Created at:</Text>
                {" " + new Date(member.created_at).toLocaleString()}
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
          <DialogTitle>Are you sure to delete this member?</DialogTitle>
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
