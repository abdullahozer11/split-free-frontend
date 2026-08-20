import { View, TouchableOpacity, Pressable } from "react-native";
import { Text, Button } from "@/src/components/Translated";
import { Avatar, Divider } from "react-native-paper";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";

type PersonView = {
  name: string;
  avatar_url?: string | null;
};

type MemberProfile = {
  id?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

export type MemberView = {
  id: number;
  name: string;
  role?: string | null;
  group_id?: number;
  profile?: MemberProfile | null;
};

type PayerProps = {
  payer: PersonView;
  amount?: string | number | null;
};

export const Payer = ({ payer, amount }: PayerProps) => {
  return (
    <View className="bg-white flex-row px-2 py-3 items-center rounded-[15px] px-5">
      <View className="flex-row items-center flex-1">
        <Avatar.Image
          size={36}
          source={
            payer.avatar_url
              ? { uri: payer.avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant={"bodyLarge"} className="ml-2">
          {payer.name}
        </Text>
      </View>
      <Text variant={"bodyLarge"} className="text-green-500">
        €{amount}
      </Text>
    </View>
  );
};

type ParticipantProps = {
  participant: PersonView;
  amount?: string | number | null;
};

export const Participant = ({ participant, amount }: ParticipantProps) => {
  return (
    <View className="bg-white flex-row px-2 py-3 items-center rounded-[15px] px-5">
      <View className="flex-row items-center flex-1">
        <Avatar.Image
          size={36}
          source={
            participant.avatar_url
              ? { uri: participant.avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant={"bodyLarge"} className="ml-2">
          {participant.name}
        </Text>
      </View>
      <Text variant={"bodyLarge"} className="text-red-500">
        €{amount}
      </Text>
    </View>
  );
};

type MemberProps = {
  member: MemberView;
  assignable?: boolean;
  onAssign?: () => void;
  myOwnMember?: boolean;
};

export const Member = ({
  member,
  assignable,
  onAssign,
  myOwnMember,
}: MemberProps) => {
  return (
    <Link
      href={`/(tabs)/group/${member.group_id}/member/${member.id}/details`}
      asChild
    >
      <Pressable className="bg-white flex-row px-4 py-3 items-center rounded-[15px] mb-2">
        <View className="flex-row items-center flex-1">
          <Avatar.Image
            size={36}
            source={
              member.profile?.avatar_url
                ? { uri: member.profile?.avatar_url }
                : require("@/assets/images/blank-profile.png")
            }
          />
          <Text
            variant={"bodyLarge"}
            numberOfLines={1}
            className="ml-2 flex-shrink"
          >
            {member.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          {myOwnMember && (
            <Text
              variant={"labelMedium"}
              style={{ color: "green" }}
              className="mr-1"
            >
              Me
            </Text>
          )}
          {member.role === "owner" && (
            <Feather name={"award"} size={24} color={"silver"} />
          )}
          {assignable && (
            <TouchableOpacity onPress={onAssign}>
              <Feather name={"plus-circle"} size={24} color={"green"} />
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Link>
  );
};

type DeletableMemberProps = {
  member: Pick<MemberView, "name"> &
    Partial<Pick<MemberView, "id" | "role" | "profile">>;
  onDelete: () => void;
};

export const DeletableMember = ({ member, onDelete }: DeletableMemberProps) => {
  return (
    <View className="bg-white flex-row px-4 py-3 items-center rounded-[15px]">
      <View className="flex-row items-center flex-1">
        <Avatar.Image
          size={36}
          source={
            member.profile?.avatar_url
              ? { uri: member.profile?.avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant={"bodyLarge"} className="ml-2">
          {member.name}
        </Text>
      </View>
      {member.role === "owner" ? null : (
        <TouchableOpacity onPress={onDelete}>
          <Feather name={"x"} color={"red"} size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export type DebtView = {
  amount?: number | null;
  borrower?: number;
  lender?: number;
};

type DebtProps = {
  debt: DebtView;
  members?: readonly MemberView[] | null;
};

export const Debt = ({ debt, members }: DebtProps) => {
  const lender = members?.find((member) => member.id === debt?.lender) ?? null;
  const borrower =
    members?.find((member) => member.id === debt?.borrower) ?? null;

  return (
    <View className="bg-white flex-row px-4 py-3 items-center rounded-[15px] mb-2">
      <View className="flex-row items-center flex-1">
        <Avatar.Image
          size={36}
          source={
            borrower?.profile?.avatar_url
              ? { uri: borrower.profile?.avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant="bodyMedium" className="flex-1 mx-2" numberOfLines={1}>
          {borrower?.name}
        </Text>
        <Feather name={"arrow-right"} size={24} className="mx-2" />
        <Text variant="bodyMedium" className="flex-1 mx-2" numberOfLines={1}>
          {lender?.name}
        </Text>
        <Avatar.Image
          size={36}
          source={
            lender?.profile?.avatar_url
              ? { uri: lender.profile?.avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant={"labelLarge"} className="ml-2">
          € {debt?.amount?.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

export type SearchableProfile = {
  id: string;
  email?: string | null;
  avatar_url?: string | null;
  friend_status?: string | null;
};

type SearchProfileProps = {
  profile: SearchableProfile;
  onAdd: (id: string) => void;
  onCancel: (id: string) => void;
};

export const SearchProfile = ({
  profile,
  onAdd,
  onCancel,
}: SearchProfileProps) => {
  return (
    <View className="bg-white flex-row px-4 py-3 items-center rounded-[15px]">
      <View className="flex-row items-center flex-1">
        <Avatar.Image
          size={36}
          source={
            profile.avatar_url
              ? { uri: profile.avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant={"bodyLarge"} className="ml-2 flex-1">
          {profile.email}
        </Text>
        {profile.friend_status === "AVAILABLE" && (
          <TouchableOpacity onPress={() => onAdd(profile.id)}>
            <Feather name={"user-plus"} size={24} />
          </TouchableOpacity>
        )}
        {profile.friend_status === "FRIEND" && (
          <Feather name={"user-check"} size={24} color={"green"} />
        )}
        {profile.friend_status === "SENT" && (
          <Button onPress={() => onCancel(profile.id)}>Pending</Button>
        )}
        {profile.friend_status === "RECEIVED" && (
          <Button
            onPress={() => {
              console.log("pressed on accept");
            }}
          >
            Accept
          </Button>
        )}
      </View>
    </View>
  );
};

type FriendProps = {
  email?: string | null;
  avatar_url?: string | null;
  onRemove: () => void;
};

export const Friend = ({ email, avatar_url, onRemove }: FriendProps) => {
  return (
    <View className="bg-white flex-row px-4 py-3 items-center rounded-[15px] mb-2">
      <View className="flex-row items-center flex-1">
        <Avatar.Image
          size={36}
          source={
            avatar_url
              ? { uri: avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant={"bodyLarge"} className="ml-2 flex-1">
          {email}
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Feather name={"user-x"} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

type Friend2Props = {
  email?: string | null;
  avatar_url?: string | null;
  onInvite: () => void;
  status?: string | null;
};

export const Friend2 = ({
  email,
  avatar_url,
  onInvite,
  status,
}: Friend2Props) => {
  return (
    <View className="bg-white flex-row px-4 py-3 items-center">
      <View className="flex-row items-center flex-1">
        <Avatar.Image
          size={36}
          source={
            avatar_url
              ? { uri: avatar_url }
              : require("@/assets/images/blank-profile.png")
          }
        />
        <Text variant={"bodyLarge"} className="ml-2 flex-1">
          {email}
        </Text>
        {status === "available" && (
          <TouchableOpacity onPress={onInvite}>
            <Feather name={"user-plus"} size={24} />
          </TouchableOpacity>
        )}
        {status === "invited" && <Text variant={"labelMedium"}>Invited</Text>}
        {status === "member" && <Feather name={"user-check"} size={24} />}
      </View>
    </View>
  );
};

type NotifLineProps = {
  email?: string | null;
  onAccept: () => void;
  onIgnore: () => void;
};

export const NotifLine = ({ email, onAccept, onIgnore }: NotifLineProps) => {
  return (
    <>
      <View className="py-2 px-1 flex-row justify-between items-center">
        <Text>Invite from </Text>
        <Text className="flex-shrink" numberOfLines={1}>
          {email}
        </Text>
        <View className="flex-row pl-2">
          <TouchableOpacity
            className="rounded-md border-green-500 border-[1px]"
            onPress={onAccept}
          >
            <Feather name={"check"} size={24} color={"green"} />
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-md border-red-500 border-[1px] ml-2"
            onPress={onIgnore}
          >
            <Feather name={"x"} size={24} color={"red"} />
          </TouchableOpacity>
        </View>
      </View>
      <Divider />
    </>
  );
};
