import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";

const JoinScreen = () => {
  const { token } = useLocalSearchParams<{ token: string }>(); // Get token from ?token=...
  const router = useRouter();
  const { session } = useAuth(); // Get current user session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      Alert.alert("Error", "Invalid invite link.");
      setLoading(false);
      router.back(); // Or navigate home
      return;
    }

    handleJoin(token);
  }, [token, session]);

  const handleJoin = async (token: string) => {
    setLoading(true);

    // Check if authenticated
    if (!session) {
      // Not logged in: Redirect to login screen, pass pending token via params
      // Alternatively, use AsyncStorage to store it globally for post-login handling
      router.push({
        pathname: "/(auth)/sign-in", // Adjust to your login route, e.g., /(auth)/sign-in
        params: { pendingToken: token },
      });
      setLoading(false);
      return;
    }

    try {
      // Validate token
      const { data: invite, error: validateError } = await supabase
        .from("invite_tokens")
        .select("group_id, used, expires_at")
        .eq("token", token)
        .single();

      if (validateError || !invite) {
        throw new Error("Invalid invite link.");
      }

      if (invite.used || (invite.expires_at && new Date(invite.expires_at) < new Date())) {
        throw new Error("This invite has already been used or expired.");
      }

      const userId = session.user.id;
      const groupId = invite.group_id;

      // Check if already a member (optional) // todo
      const { data: existingMember } = await supabase
        .from("members")
        .select("id")
        .eq("group_id", groupId)
        .eq("profile", userId)
        .single();

      if (existingMember) {
        throw new Error("You are already a member of this group.");
      }

      // Add to group
      const { error: insertError } = await supabase
        .from("members")
        .insert({ name: "new_member", group_id: groupId, profile: userId, role: "member" });

      if (insertError) {
        throw new Error("Error joining group.");
      }

      // Mark as used (or delete)
      await supabase
        .from("invite_tokens")
        .update({ used: true })
        .eq("token", token); // Or .delete().eq("token", token)

      Alert.alert("Success", "Successfully joined the group!");
      router.push(`/group/${groupId}`); // Navigate to the group details screen
    } catch (error) {
      Alert.alert("Error", error.message);
      router.back(); // Or home
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text>Joining group...</Text>
    </View>
  );
};

export default JoinScreen;
