import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {supabase} from "@/src/lib/supabase";

export const useMemberSubscription = (group_id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const memberSubscription = supabase
      .channel('table-filter-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'members',
          filter: 'group_id=eq.' + group_id,
        },
        (payload) => {
          console.log('Change received!', payload);
          queryClient.invalidateQueries(['members', group_id]);
        }
      )
      .subscribe();

    return () => {
      memberSubscription.unsubscribe();
    };
  }, []);
};
