import {supabase} from "@/src/lib/supabase";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {uuid} from "expo-modules-core";

export const useUpdateProfile = () => {
  return useMutation({
    async mutationFn(profile) {
      const {error} = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id);
      if (error) {
        console.log("useUpdateProfile error: ", error);
        throw new Error(error.message);
      }
      // console.log("updatedProfile success: ");
    },
  });
};

export const useProfile = (uid) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {data: profile , error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      // console.log("Fetched profile is :", profile);
      return profile;
    }
  });
};

export const getFriends = (uid) => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('friends')
        .select('profile:friend(id, email, avatar_url)')
        .eq('profile', uid);
      if (error) {
        console.log("GetFriends error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("getFriends success: ", data);
      return data;
    }
  })
}

export const getFriendRequests = (uid) => {
  return useQuery({
    queryKey: ['friend_requests'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('friend_requests')
        .select('id, sender, sender_profile:sender(email)')
        .eq('receiver', uid);
      if (error) {
        console.log("getFriendRequests error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("getFriendRequests success: ", data);
      return data;
    }
  })
}

export const useInsertFriendRequest = () => {
  return useMutation({
    async mutationFn(data) {
      const {error} = await supabase
        .from('friend_requests')
        .insert({
          sender: data?.sender_id,
          receiver: data?.receiver_id,
        });
      if (error) {
        console.error('useInsertFriendRequest error:', error.message);
        throw new Error(error.message);
      }
      // console.log('useInsertFriendRequest success');
    },
  });
};

export const useUnfriend = () => {
  return useMutation({
    async mutationFn(friend_id: uuid) {
      const {error} = await supabase
        .from('friends')
        .delete()
        .or(`profile.eq.${friend_id},friend.eq.${friend_id}`);
      if (error) {
        console.error('useUnfriend error:', error.message);
        throw new Error(error.message);
      }
      // console.log('useUnfriend success');
    },
  });
};

export const useAcceptFriend = () => {
  return useMutation({
    async mutationFn(sender_uid) {
      const {error} = await supabase
        .rpc('accept_friend_request', {
          sender_uid: sender_uid
        })
      if (error) {
        console.error('useAcceptFriend error:', error.message);
        throw new Error(error.message);
      }
      // console.log('useAcceptFriend success');
    },
  });
};

export const useInsertGroupInvitation = () => {
  return useMutation({
    async mutationFn(data) {
      const {error} = await supabase
        .from('group_invitations')
        .insert(data);
      if (error) {
        console.error('useInsertGroupInvitation error: ', error.message);
        throw new Error(error.message);
      }
      // console.log('useInsertGroupInvitation success');
    },
  });
};

export const useGroupInvitationsForProfile = (uid) => {
  return useQuery({
    queryKey: ['group_invites_for_profile'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('group_invitations')
        .select('id, group_name, group_id, sender_profile:sender(id, email)')
        .eq('receiver', uid);
      if (error) {
        console.log("useGroupInvitationsForProfile error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("useGroupInvitationsForProfile success");
      return data;
    }
  })
}

export const usePendingGroupInvitesForGroup = (groupId) => {
  return useQuery({
    queryKey: ['group_invites_for_group'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('group_invitations')
        .select('receiver_profile:receiver(id, email)')
        .eq('group_id', groupId);
      if (error) {
        console.log("usePendingGroupInvitesForGroup error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("usePendingGroupInvitesForGroup success");
      return data;
    }
  })
}

export const useAcceptInvite = () => {
  return useMutation({
    async mutationFn(data) {
      const {error} = await supabase
        .rpc('accept_group_invite', data);
      if (error) {
        console.error('useAcceptInvite error: ', error.message);
        throw new Error(error.message);
      }
      // console.log('useAcceptInvite successfull');
    },
  });
};

export const useRejectInvite = () => {
  return useMutation({
    async mutationFn(invite_id) {
      const {error} = await supabase
        .from('group_invitations')
        .delete()
        .eq('id', invite_id);
      if (error) {
        console.error('useRejectInvite error: ', error.message);
        throw new Error(error.message);
      }
      // console.log('useRejectInvite is successfull');
    },
  });
};

export const useAssignMember = () => {
  return useMutation({
    async mutationFn(data) {
      const {error} = await supabase
        .rpc('assign_new_member', data);
      if (error) {
        console.error('useAssignMember error: ', error.message);
        throw new Error(error.message);
      }
      // console.log('useAssignMember success');
    },
  });
};

export const useUpdateProfileSingleField = () => {
  return useMutation({
    mutationFn: async ({ id, field, value }) => {
      const updates = {};
      updates[field] = value;
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      if (error) {
        console.log("useUpdateProfileSingleField error: ", error);
        throw new Error(error.message);
      }
      // console.log("useUpdateProfileSingleField success");
    },
  });
};
