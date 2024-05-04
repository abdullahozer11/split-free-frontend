import {supabase} from "@/src/lib/supabase";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";


export const useMemberList = (groupId: number) => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('members')
        .select('id, name')
        .eq('group_id', groupId);
      if (error) {
        // console.log(error.message);
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const usePayerList = (expense_id: number) => {
  return useQuery({
    queryKey: ['expense_payers'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('expense_payers')
        .select('id, member(name, profile(avatar_url))')
        .eq('expense', expense_id);
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      // console.log('expense payers are', data);
      return data;
    },
  });
};

export const useParticipantList = (expense_id: number) => {
  return useQuery({
    queryKey: ['expense_participants'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('expense_participants')
        .select('id, member(name, profile(avatar_url))')
        .eq('expense', expense_id);
      if (error) {
        // console.log(error.message);
        throw new Error(error.message);
      }
      // console.log('expense participants are', data);
      return data;
    },
  });
};
