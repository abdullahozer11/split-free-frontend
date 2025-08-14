import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslatedAlert } from "@/src/components/Translated";

const JoinScreen = () => {
  const { alert } = useTranslatedAlert();
  const params = useLocalSearchParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [showSelection, setShowSelection] = useState(false);
  const [unboundMembers, setUnboundMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    if (!token) {
      alert("Error", "Invalid invite link.");
      setLoading(false);
      router.replace("/(tabs)");
      return;
    }

    handleValidateAndFetchUnbound(token);
  }, [token, session]);

  const validateToken = async (token: string) => {
    try {
      const { data: invite, error } = await supabase
        .from('invite_tokens')
        .select('group_id, used, expires_at')
        .eq('token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          throw new Error("Invalid invite link.");
        }
        throw new Error("Error validating invite link.");
      }

      if (!invite) {
        throw new Error("Invalid invite link.");
      }

      if (invite.used) {
        throw new Error("This invite has already been used.");
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        throw new Error("This invite has expired.");
      }

      return invite.group_id;
    } catch (error) {
      throw error;
    }
  };

  const checkExistingMembership = async (groupId: number, userId: string) => {
    const { data: existingMember, error } = await supabase
      .from('members')
      .select('id')
      .eq('group_id', groupId)
      .eq('profile', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error("Error checking membership.");
    }

    return !!existingMember;
  };

  const handleValidateAndFetchUnbound = async (token: string) => {
    setLoading(true);

    // Check if authenticated and user exists
    if (!session || !session.user) {
      router.push({
        pathname: "/(auth)/sign-in",
        params: { pendingToken: token },
      });
      setLoading(false);
      return;
    }

    try {
      // Validate token and get group ID
      const fetchedGroupId = await validateToken(token);
      setGroupId(fetchedGroupId);

      // Check if user is already a member
      const isExistingMember = await checkExistingMembership(fetchedGroupId, session.user.id);

      if (isExistingMember) {
        alert("Info", "You are already in this group.");
        router.replace(`/(tabs)/group/`);
        return;
      }

      // Fetch unbound members via RPC
      const { data: unbound, error: unboundError } = await supabase
        .rpc("get_unbound_members_for_token", { p_token: token });

      if (unboundError) {
        throw new Error("Error fetching available members.");
      }

      setUnboundMembers(unbound || []);
      setShowSelection(true);
    } catch (error) {
      alert("Error", error.message);
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  const handleBind = async (memberId: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .rpc("join_group_with_token", { p_token: token, p_member_id: memberId });

      if (error) {
        // Handle specific database errors gracefully
        if (error.message.includes('already been used or expired')) {
          throw new Error("This invite has expired or been used by someone else.");
        } else if (error.message.includes('already a member')) {
          throw new Error("You are already a member of this group.");
        } else if (error.message.includes('Invalid member ID')) {
          throw new Error("This member is no longer available.");
        } else {
          throw new Error("Unable to join group. Please try again.");
        }
      }

      if (!groupId) {
        throw new Error("Group information unavailable.");
      }

      // Invalidate queries
      await queryClient.invalidateQueries(["groups"]);
      await queryClient.invalidateQueries(["members", groupId]);

      alert("Success", "Successfully joined the group!");
      router.replace(`/(tabs)/group/${groupId}`);
    } catch (error) {
      alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      alert("Error", "Please enter a name.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .rpc("join_group_with_token", { p_token: token, p_new_name: newName.trim() });

      if (error) {
        // Handle specific database errors gracefully
        if (error.message.includes('already been used or expired')) {
          throw new Error("This invite has expired or been used by someone else.");
        } else if (error.message.includes('already a member')) {
          throw new Error("You are already a member of this group.");
        } else {
          throw new Error("Unable to join group. Please try again.");
        }
      }

      if (!groupId) {
        throw new Error("Group information unavailable.");
      }

      // Invalidate queries
      await queryClient.invalidateQueries(["groups"]);
      await queryClient.invalidateQueries(["members", groupId]);

      alert("Success", "Successfully joined the group!");
      router.replace('/(tabs)/group');
    } catch (error) {
      alert("Error", error.message);
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
        <Text className="text-2xl font-bold mb-6 text-center mt-20">Join Group</Text>
        {unboundMembers.length > 0 ? (
          <>
            <Text className="text-lg mb-4 text-center">Select an existing unbound member to join as:</Text>
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
          <Text className="text-lg mb-6 text-center">No unbound members available. Create a new one below.</Text>
        )}
        <Text className="text-lg mt-6 mb-3 text-center">Or create a new member:</Text>
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
          <Text className="text-white text-lg font-semibold text-center">Create and Join</Text>
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
