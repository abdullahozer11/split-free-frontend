import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {supabase} from "@/src/lib/supabase";

export const useInsertExpenseSubscription = (group_id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const freqSubscription = supabase
      .channel('table-filter-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expenses',
          filter: 'group_id=eq.' + group_id,
        },
        (payload) => {
          console.log('Change received!', payload);
          queryClient.invalidateQueries(['expenses', group_id]);
        }
      )
      .subscribe();

    return () => {
      freqSubscription.unsubscribe();
    };
  }, []);
};
