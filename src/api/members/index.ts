import {supabase} from "@/src/lib/supabase";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";


export const useMemberList = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('members')
        .select('id, name');
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

export const useInsertMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: newMember} = await supabase
        .from('members')
        .insert({
          name: data.name,
          group: data.group,
        })
        .single();
      if (error) {
        console.error('Error during insertion:', error);
        throw new Error(error.message);
      }
      return newMember;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['members']);
    }
  });
};

export const useBulkInsertMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: newMembers} = await supabase
        .from('members')
        .insert(data);
      if (error) {
        console.error('Error during insertion:', error);
        throw new Error(error.message);
      }
      return newMembers;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['members']);
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
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['members']);
    }
  });
};
