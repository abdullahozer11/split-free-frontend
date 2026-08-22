import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/src/database.types";

type UnboundMember =
  Database["public"]["Functions"]["get_unbound_members_for_token"]["Returns"][number];

const unknownErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

const JoinScreen = () => {
  const params = useLocalSearchParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [showSelection, setShowSelection] = useState(false);
  const [unboundMembers, setUnboundMembers] = useState<UnboundMember[]>([]);
  const [newName, setNewName] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);

  useEffect(() => {
    console.log("useEffect triggered with token:", token);
    console.log("Current session in useEffect:", session);
    if (!token) {
      Alert.alert("Error", "Invalid invite link.");
      setLoading(false);
      router.replace("/(tabs)/group");
      return;
    }

    handleFetchUnbound(token);
  }, [token, session]);

  const handleFetchUnbound = async (inviteToken: string) => {
    console.log("Entering handleFetchUnbound with token:", inviteToken);
    console.log("Current session:", session);
    setLoading(true);

    // Check if authenticated and user exists
    if (!session || !session.user) {
      console.log("No session or user, redirecting to sign-in");
      router.push({
        pathname: "/(auth)/sign-in",
        params: { pendingToken: inviteToken },
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching invite for token:", inviteToken);
      const { data: fetchedGroupId, error: inviteError } = await supabase.rpc(
        "get_invite_group_id",
        { p_token: inviteToken },
      );

      console.log(
        "Invite group id:",
        fetchedGroupId,
        "Invite error:",
        inviteError,
      );

      if (inviteError || fetchedGroupId == null) {
        throw new Error(inviteError?.message || "Invalid invite token.");
      }
      console.log("Fetched groupId:", fetchedGroupId);

      console.log(
        "Checking membership for user:",
        session.user.id,
        "in group:",
        fetchedGroupId,
      );
      const { data: existingMember, error: memberError } = await supabase
        .from("members")
        .select("id")
        .eq("group_id", fetchedGroupId)
        .eq("profile", session.user.id)
        .limit(1)
        .single();

      console.log(
        "Existing member data:",
        existingMember,
        "Member error:",
        memberError,
      );

      if (memberError && memberError?.code !== "PGRST116") {
        throw new Error(memberError?.message || "Error checking membership.");
      }

      if (existingMember) {
        Alert.alert("Info", "You are already in this group.");
        console.log(
          "Existing member found, navigating to group:",
          fetchedGroupId,
        );
        router.replace({
          pathname: "/(tabs)/group/[group_id]/details",
          params: { group_id: fetchedGroupId },
        });
        return;
      }

      console.log("Fetching unbound members for token:", inviteToken);
      const { data: unbound, error: unboundError } = await supabase.rpc(
        "get_unbound_members_for_token",
        { p_token: inviteToken },
      );

      console.log(
        "Unbound members data:",
        unbound,
        "Unbound error:",
        unboundError,
      );

      if (unboundError) {
        throw new Error(
          unboundError.message || "Error fetching unbound members.",
        );
      }

      setUnboundMembers(unbound || []);
      setGroupId(fetchedGroupId);

      setShowSelection(true);
    } catch (error) {
      console.log("Error in handleFetchUnbound:", error);
      Alert.alert("Error", unknownErrorMessage(error));
      router.replace("/(tabs)/group");
    } finally {
      setLoading(false);
    }
  };

  const handleBind = async (memberId: string) => {
    console.log(
      "Entering handleBind with memberId:",
      memberId,
      "groupId:",
      groupId,
    );
    if (!token) {
      Alert.alert("Error", "Invalid invite link.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("join_group_with_token", {
        p_token: token,
        p_member_id: memberId,
      });

      console.log("Bind RPC data:", data, "Error:", error);

      if (error) {
        throw new Error(error.message || "Error binding to member.");
      }

      if (!groupId) {
        throw new Error("Group ID not available.");
      }

      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      await queryClient.invalidateQueries({ queryKey: ["members", groupId] });

      Alert.alert("Success", "Successfully joined the group!");
      console.log("Navigating after bind to group:", groupId);
      router.replace({
        pathname: "/(tabs)/group/[group_id]/details",
        params: { group_id: groupId },
      });
    } catch (error) {
      console.log("Error in handleBind:", error);
      Alert.alert("Error", unknownErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    console.log(
      "Entering handleCreate with newName:",
      newName,
      "groupId:",
      groupId,
    );
    if (!newName.trim()) {
      Alert.alert("Error", "Please enter a name.");
      return;
    }
    if (!token) {
      Alert.alert("Error", "Invalid invite link.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("join_group_with_token", {
        p_token: token,
        p_new_name: newName.trim(),
      });

      console.log("Create RPC data:", data, "Error:", error);

      if (error) {
        throw new Error(error.message || "Error creating new member.");
      }

      if (!groupId) {
        throw new Error("Group ID not available.");
      }

      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      await queryClient.invalidateQueries({ queryKey: ["members", groupId] });

      Alert.alert("Success", "Successfully joined the group!");
      console.log("Navigating after create to group:", groupId);
      router.replace({
        pathname: "/(tabs)/group/[group_id]/details",
        params: { group_id: groupId },
      });
    } catch (error) {
      console.log("Error in handleCreate:", error);
      Alert.alert("Error", unknownErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (showSelection) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-white">
        <Text className="text-2xl font-bold mb-6 text-center mt-20">
          Join Group
        </Text>
        {unboundMembers.length > 0 ? (
          <>
            <Text className="text-lg mb-4 text-center">
              Select an existing unbound member to join as:
            </Text>
            <FlatList
              data={unboundMembers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleBind(item.id)}
                  className="bg-gray-100 p-4 rounded-lg mb-3 w-full max-w-md shadow-sm"
                >
                  <Text className="text-lg text-center">{item.name}</Text>
                </TouchableOpacity>
              )}
              className="w-full max-w-md"
            />
          </>
        ) : (
          <Text className="text-lg mb-6 text-center">
            No unbound members available. Create a new one below.
          </Text>
        )}
        <Text className="text-lg mt-6 mb-3 text-center">
          Or create a new member:
        </Text>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Enter your name"
          className="border border-gray-300 p-3 rounded-lg mb-4 w-full max-w-md text-lg bg-white shadow-sm"
        />
        <TouchableOpacity
          onPress={handleCreate}
          className="bg-blue-500 p-4 rounded-lg w-full max-w-md"
        >
          <Text className="text-white text-lg font-semibold text-center">
            Create and Join
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg">Joining group...</Text>
    </View>
  );
};

export default JoinScreen;
