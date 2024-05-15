import {supabase} from "@/src/lib/supabase";
import {useQuery} from "@tanstack/react-query";


export const useMemberList = (groupId: number) => {
  return useQuery({
    queryKey: ['members', groupId],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('members')
        .select('id, name, profile')
        .eq('group_id', groupId);
      if (error) {
        // console.log(error.message);
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useMember = (memberId: number) => {
  return useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('members')
        .select('*, group:group_id(title), profile(email, avatar_url)')
        .eq('id', memberId)
        .single();
      if (error) {
        console.log("useMember error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('useMember success: ', data);
      return data;
    },
  });
};

export const useProfileMember = (profileId: string, groupId: number) => {
  return useQuery({
    queryKey: ['profileMember', groupId],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('members')
        .select('id')
        .eq('profile', profileId)
        .eq('group_id', groupId)
        .single();
      if (error) {
        console.log("useProfileMember error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('useProfileMember success: ', data);
      return data;
    },
    enabled: !!profileId && !!groupId, // Ensure the query is only enabled when both profileId and groupId are defined
  });
};
