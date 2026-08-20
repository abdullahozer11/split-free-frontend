import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { realtimeTopic } from "@/src/lib/realtime";
import { supabase } from "@/src/lib/supabase";

export const useGroupSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const groupSubscription = supabase
      .channel(realtimeTopic("public:groups"))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "groups",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupSubscription);
    };
  }, [queryClient]);
};

export const useGroupInviteSubscriptions = (profile_id?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile_id) {
      return;
    }

    const groupInviteSubscription = supabase
      .channel(realtimeTopic(`public:group_invitations:receiver:${profile_id}`))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_invitations",
          filter: "receiver=eq." + profile_id,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupInviteSubscription);
    };
  }, [profile_id, queryClient]);
};
