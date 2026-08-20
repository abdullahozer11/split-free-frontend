import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";

export const useMemberSubscription = (group_id?: number) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!group_id) {
      return;
    }

    const memberSubscription = supabase
      .channel(`public:members:group:${group_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
          filter: "group_id=eq." + group_id,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["members", group_id] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(memberSubscription);
    };
  }, [group_id, queryClient]);
};
