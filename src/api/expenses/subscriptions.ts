import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId } from "react";
import { supabase } from "@/src/lib/supabase";

export const useExpenseSubscription = (group_id?: number) => {
  const queryClient = useQueryClient();
  const instanceId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!group_id) {
      return;
    }

    const expenseSubscription = supabase
      .channel(`public:expenses:group:${group_id}:${instanceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: "group_id=eq." + group_id,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["expenses", group_id],
          });
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expenseSubscription);
    };
  }, [group_id, queryClient, instanceId]);
};
