import {supabase} from "@/src/lib/supabase";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

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
        console.log("error is ", error);
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
        .rpc('get_friends', {
          profile_id_input: uid,
        });
      if (error) {
        console.log("error is ", error.message);
        throw new Error(error.message);
      }
      // console.log("Friends are ", data);
      return data;
    }
  })
}

export const useInsertFriendRequest = () => {
  return useMutation({
    async mutationFn(data) {
      const {data: status, error} = await supabase
        .from('friend_requests')
        .insert({
          sender: data?.sender_id,
          receiver: data?.receiver_id,
          status: data?.status,
          message: data?.message
        });
      if (error) {
        console.error('Error during insertion:', error.message);
        throw new Error(error.message);
      }
      console.log('New friend request is inserted', status);
      return data;
    },
    async onSuccess() {
    }
  });
};
