import {supabase} from "@/src/lib/supabase";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {uuid} from "expo-modules-core";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: updatedProfile} = await supabase
        .from('profiles')
        .update({
          avatar_url: data.avatar_url,
          full_name: data.full_name,
          phone_number: data.phone_number,
          website: data.website,
        })
        .eq('id', data.id)
        .select()
        .single();
      if (error) {
        console.log("errorr is ", error);
        throw new Error(error.message);
      }
      console.log("updatedProfile: ", updatedProfile);
      return updatedProfile;
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['profile']);
    }
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
        console.log("GetFriends error is ", error.message);
        throw new Error(error.message);
      }
      // console.log("Friends are ", data);
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
        console.log("Get friend requests error is ", error.message);
        throw new Error(error.message);
      }
      // console.log("Friend requests are ", data);
      return data;
    }
  })
}

export const useInsertFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data) {
      const {data: _, error} = await supabase
        .from('friend_requests')
        .insert({
          sender: data?.sender_id,
          receiver: data?.receiver_id,
        });
      if (error) {
        console.error('Error during insertion:', error.message);
        throw new Error(error.message);
      }
      console.log('New friend request is inserted');
      return;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['friends']);
    }
  });
};

export const useUnfriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(friend_id: uuid) {
      const {error} = await supabase
        .from('friends')
        .delete()
        .or(`profile.eq.${friend_id},friend.eq.${friend_id}`);
      if (error) {
        console.error('Error during unfriending:', error.message);
        throw new Error(error.message);
      }
      console.log('Unfriend is successful');
      return;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['friends']);
    }
  });
};

export const useAcceptFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(sender_uid) {
      const {data: status, error} = await supabase
        .rpc('accept_friend_request', {
          sender_uid: sender_uid
        })
      if (error) {
        console.error('Error during insertion:', error.message);
        throw new Error(error.message);
      }
      console.log('Friend request is accepted', status);
      return status;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['friends']);
      await queryClient.invalidateQueries(['friend_requests']);
    }
  });
};
