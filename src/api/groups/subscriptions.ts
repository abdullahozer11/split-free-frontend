import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {supabase} from "@/src/lib/supabase";

export const useGroupSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const groupSubscription = supabase
      .channel('table-filter-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
        },
        (payload) => {
          console.log('Change received!', payload);
          queryClient.invalidateQueries(['groups']);
        }
      )
      .subscribe();

    return () => {
      groupSubscription.unsubscribe();
    };
  }, []);
};
