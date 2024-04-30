import {supabase} from "@/src/lib/supabase";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/src/providers/AuthProvider";


export const useGroupList = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('groups')
        .select('id, status, title, members(count), expenses(count)');
      if (error) {
        // console.log(error.message);
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useGroup = (id: number) => {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('groups')
        .select('id, title, members(name, role, profile(avatar_url))')
        .eq('id', id)
        .single();
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      // console.log("data received is ", data);
      return data;
    }
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(id) {
      const {error} = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      if (error) {
        // console.error('Error during delete:', error);
        throw new Error(error.message);
      }
      // console.log("group is deleted");
      return true;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['groups']);
    }
  });
};

export const useInsertGroup = () => {
  const queryClient = useQueryClient();
  const {profile} = useAuth();

  return useMutation({
    async mutationFn(data) {
      // console.log('Data received for insertion:', data);
      const {data: newGroupID, error} = await supabase
        .rpc('create_group', {
          member_names_input: data.member_names,
          profile_id_input: profile.id,
          title_input: data.title
        });
      if (error) {
        console.error('Error during insertion:', error);
        throw new Error(error.message);
      }
      console.log('New group inserted:', newGroupID);
      return newGroupID;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['groups']);
      await queryClient.invalidateQueries(['members']);
    }
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data) {
      const {error} = await supabase
        .rpc('update_group', {
          member_names_input: data.member_names,
          group_id_input: data.group_id,
          title_input: data.title,
          description_input: data.description
        })
      if (error) {
        console.error('Error during update:', error);
        throw new Error(error.message);
      }
      return data.group_id;
    },
    async onSuccess(groupID) {
      await queryClient.invalidateQueries(['members']);
      await queryClient.invalidateQueries(['groups', groupID]);
    }
  });
};
