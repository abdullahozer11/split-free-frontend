import { supabase } from "@/src/lib/supabase";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Database } from "@/src/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type GroupInvitationInsert =
  Database["public"]["Tables"]["group_invitations"]["Insert"];
type SelfAssignArgs = Database["public"]["Functions"]["self_assign_to"]["Args"];

export const useUpdateProfile = () => {
  return useMutation({
    async mutationFn(profile: ProfileUpdate & { id: string }) {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);
      if (error) {
        console.log("useUpdateProfile error: ", error);
        throw new Error(error.message);
      }
      // console.log("updatedProfile success: ");
    },
  });
};

export const useProfile = (uid: string) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();
      if (error) {
        console.log("useProfile error is ", error.message);
        throw new Error(error.message);
      }
      // console.log("Fetched profile is :", profile);
      return profile;
    },
  });
};

export const useFriends = (uid: string) => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friends")
        .select("profile:friend(id, email, avatar_url)")
        .eq("profile", uid);
      if (error) {
        console.log("useFriends error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("useFriends success: ", data);
      return data;
    },
  });
};

export const useFriendRequests = (uid: string) => {
  return useQuery({
    queryKey: ["friend_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("id, sender, sender_profile:sender(email)")
        .eq("receiver", uid);
      if (error) {
        console.log("useFriendRequests error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("useFriendRequests success: ", data);
      return data;
    },
  });
};

export const useInsertFriendRequest = () => {
  return useMutation({
    async mutationFn(data: { sender_id: string; receiver_id: string }) {
      const { error } = await supabase.from("friend_requests").insert({
        sender: data.sender_id,
        receiver: data.receiver_id,
      });
      if (error) {
        console.error("useInsertFriendRequest error:", error.message);
        throw new Error(error.message);
      }
      // console.log('useInsertFriendRequest success');
    },
  });
};

export const useDeleteFriendRequest = () => {
  return useMutation({
    async mutationFn(req: { sender: string; receiver: string }) {
      console.log("profile is: ", req.sender);
      console.log("receiver is: ", req.receiver);
      const { error } = await supabase
        .from("friend_requests")
        .delete()
        .eq("sender", req.sender)
        .eq("receiver", req.receiver);
      if (error) {
        console.error("useDeleteFriendRequest error:", error.message);
        throw new Error(error.message);
      }
      // console.log('useDeleteFriendRequest success');
    },
  });
};

export const useUnfriend = () => {
  return useMutation({
    async mutationFn(friend_id: string) {
      const { error } = await supabase
        .from("friends")
        .delete()
        .or(`profile.eq.${friend_id},friend.eq.${friend_id}`);
      if (error) {
        console.error("useUnfriend error:", error.message);
        throw new Error(error.message);
      }
      // console.log('useUnfriend success');
    },
  });
};

export const useAcceptFriend = () => {
  return useMutation({
    async mutationFn(sender_uid: string) {
      const { error } = await supabase.rpc("accept_friend_request", {
        sender_uid: sender_uid,
      });
      if (error) {
        console.error("useAcceptFriend error:", error.message);
        throw new Error(error.message);
      }
      // console.log('useAcceptFriend success');
    },
  });
};

export const useRejectFriend = () => {
  return useMutation({
    async mutationFn(uid: string) {
      const { error } = await supabase
        .from("friend_requests")
        .delete()
        .eq("sender", uid);
      if (error) {
        console.error("useRejectFriend error:", error.message);
        throw new Error(error.message);
      }
      // console.log('useRejectFriend success');
    },
  });
};

export const useInsertGroupInvitation = () => {
  return useMutation({
    async mutationFn(data: GroupInvitationInsert) {
      const { error } = await supabase.from("group_invitations").insert(data);
      if (error) {
        console.error("useInsertGroupInvitation error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('useInsertGroupInvitation success');
    },
  });
};

export const usePendingGroupInvitesForGroup = (groupId: number) => {
  return useQuery({
    queryKey: ["group_invites_for_group", groupId],
    enabled: Number.isFinite(groupId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_invitations")
        .select("id, receiver_profile:receiver(id, email)")
        .eq("group_id", groupId);
      if (error) {
        console.log("usePendingGroupInvitesForGroup error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("usePendingGroupInvitesForGroup success");
      return data;
    },
  });
};

export const useAssignMember = () => {
  return useMutation({
    async mutationFn(data: SelfAssignArgs) {
      const { error } = await supabase.rpc("self_assign_to", data);
      if (error) {
        console.error("useAssignMember error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('useAssignMember success');
    },
  });
};

export const useUpdateProfileSingleField = () => {
  return useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: keyof ProfileUpdate;
      value: ProfileUpdate[keyof ProfileUpdate];
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value } as ProfileUpdate)
        .eq("id", id);
      if (error) {
        console.log("useUpdateProfileSingleField error: ", error);
        throw new Error(error.message);
      }
      // console.log("useUpdateProfileSingleField success");
    },
  });
};
