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

export const useMember = (id: number) => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    }
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: updatedMember} = await supabase
        .from('members')
        .update({
          name: data.name,
        })
        .eq('id', data.id)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return updatedMember;
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['members']);
      await queryClient.invalidateQueries(['members', id]);
    }
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(id: number) {
      const {error} = await supabase.from('members').delete().eq('id', id);
      if (error) {
        console.log("error is ", error.message);
        throw new Error(error.message);
      }
    },
    async onSuccess(_, {id}) {
      console.log("successfully deleted member")
      await queryClient.invalidateQueries(['members']);
    }
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
