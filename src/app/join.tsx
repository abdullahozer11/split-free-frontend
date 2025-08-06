import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslatedAlert } from "@/src/components/Translated"; // Add if using React Query

const JoinScreen = () => {
  const { alert } = useTranslatedAlert();
  const params = useLocalSearchParams<{ token: string }>(); // Get params as object to avoid destructuring issues
  const token = params?.token;
  const router = useRouter();
  const { session } = useAuth(); // Get current user session
  const queryClient = useQueryClient(); // Optional: For invalidating queries
  const [loading, setLoading] = useState(true);
  const [showSelection, setShowSelection] = useState(false);
  const [unboundMembers, setUnboundMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [groupId, setGroupId] = useState(null); // Store groupId for later use

  useEffect(() => {
    console.log('useEffect triggered with token:', token);
    console.log('Current session in useEffect:', session);
    if (!token) {
      alert("Error", "Invalid invite link.");
      setLoading(false);
      router.replace("/(tabs)"); // Navigate to home tabs
      return;
    }

    handleFetchUnbound(token);
  }, [token, session]);

  const handleFetchUnbound = async (token: string) => {
    console.log('Entering handleFetchUnbound with token:', token);
    console.log('Current session:', session);
    setLoading(true);

    // Check if authenticated and user exists
    if (!session || !session.user) {
      console.log('No session or user, redirecting to sign-in');
      // Not logged in: Redirect to login screen, pass pending token via params
      router.push({
        pathname: "/(auth)/sign-in",
        params: { pendingToken: token },
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching invite for token:', token);
      // First, fetch the group_id from the invite token
      const { data: invite, error: inviteError } = await supabase
        .from('invite_tokens')
        .select('group_id')
        .eq('token', token)
        .single();

      console.log('Invite data:', invite, 'Invite error:', inviteError);

      if (inviteError || !invite) {
        throw new Error(inviteError?.message || "Invalid invite token.");
      }

      const fetchedGroupId = invite.group_id;
      console.log('Fetched groupId:', fetchedGroupId);

      console.log('Checking membership for user:', session.user.id, 'in group:', fetchedGroupId);
      // Check if the user is already a member of this group
      const { data: existingMember, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('group_id', fetchedGroupId)
        .eq('profile', session.user.id)
        .limit(1)
        .single();

      console.log('Existing member data:', existingMember, 'Member error:', memberError);

      if (memberError && memberError?.code !== 'PGRST116') { // Ignore 'no rows' error
        throw new Error(memberError?.message || "Error checking membership.");
      }

      if (existingMember) {
        alert("Info", "You are already in this group.");
        console.log('Existing member found, navigating to group:', fetchedGroupId);
        console.log('Navigation path:', `/(tabs)/group/${fetchedGroupId}`);
        router.replace(`/(tabs)/group/`);
        return;
      }

      console.log('Fetching unbound members for token:', token);
      // Fetch unbound members via RPC
      const { data: unbound, error: unboundError } = await supabase
        .rpc("get_unbound_members_for_token", { p_token: token });

      console.log('Unbound members data:', unbound, 'Unbound error:', unboundError);

      if (unboundError) {
        throw new Error(unboundError.message || "Error fetching unbound members.");
      }

      setUnboundMembers(unbound || []);
      setGroupId(fetchedGroupId);

      setShowSelection(true);
    } catch (error) {
      console.log('Error in handleFetchUnbound:', error);
      alert("Error", error.message);
      router.replace("/(tabs)"); // Home tabs
    } finally {
      setLoading(false);
    }
  };

  const handleBind = async (memberId: string) => {
    console.log('Entering handleBind with memberId:', memberId, 'groupId:', groupId);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .rpc("join_group_with_token", { p_token: token, p_member_id: memberId });

      console.log('Bind RPC data:', data, 'Error:', error);

      if (error) {
        throw new Error(error.message || "Error binding to member.");
      }

      // Use the stored groupId
      if (!groupId) {
        throw new Error("Group ID not available.");
      }

      // Invalidate queries
      await queryClient.invalidateQueries(["groups"]);
      await queryClient.invalidateQueries(["members", groupId]);

      alert("Success", "Successfully joined the group!");
      console.log('Navigating after bind to group:', groupId);
      router.replace(`/(tabs)/group/${groupId}`);
    } catch (error) {
      console.log('Error in handleBind:', error);
      alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    console.log('Entering handleCreate with newName:', newName, 'groupId:', groupId);
    if (!newName.trim()) {
      alert("Error", "Please enter a name.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .rpc("join_group_with_token", { p_token: token, p_new_name: newName.trim() });

      console.log('Create RPC data:', data, 'Error:', error);

      if (error) {
        throw new Error(error.message || "Error creating new member.");
      }

      // Use the stored groupId
      if (!groupId) {
        throw new Error("Group ID not available.");
      }

      // Invalidate queries
      await queryClient.invalidateQueries(["groups"]);
      await queryClient.invalidateQueries(["members", groupId]);

      alert("Success", "Successfully joined the group!");
      console.log('Navigating after create to group:', groupId);
      router.replace(`/(tabs)/group/${groupId}`);
    } catch (error) {
      console.log('Error in handleCreate:', error);
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
