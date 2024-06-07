import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {supabase} from "@/src/lib/supabase";

export const useFriendRequestSubscription = (uid) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const freqSubscription = supabase
      .channel('table-filter-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: 'receiver=eq.' + uid,
        },
        (payload) => {
          // console.log('Change received!', payload);
          queryClient.invalidateQueries(['friend_requests']);
        }
      )
      .subscribe();

    return () => {
      freqSubscription.unsubscribe();
    };
  }, []);
};
