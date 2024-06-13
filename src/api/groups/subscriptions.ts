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
          // console.log('Change received!', payload);
          queryClient.invalidateQueries(['groups']);
        }
      )
      .subscribe();

    return () => {
      groupSubscription.unsubscribe();
    };
  }, []);
};

export const useGroupInviteSubscriptions = (profile_id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const groupInviteSubscription = supabase
      .channel('table-filter-changes')
      .on(
        'postgres_changes',
        {
          event: 'insert',
          schema: 'public',
          table: 'group_invitations',
          filter: 'receiver=eq.' + profile_id,
        },
        (payload) => {
          // console.log('Change received!', payload);
          queryClient.invalidateQueries(['groups']);
        }
      )
      .subscribe();

    return () => {
      groupInviteSubscription.unsubscribe();
    };
  }, []);
};
