import {supabase} from "@/src/lib/supabase";
import {useQuery} from "@tanstack/react-query";


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
