import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";

export const useFriendRequestSubscription = (uid?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!uid) {
      return;
    }

    const freqSubscription = supabase
      .channel(`public:friend_requests:receiver:${uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: "receiver=eq." + uid,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["friend_requests"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(freqSubscription);
    };
  }, [queryClient, uid]);
};
