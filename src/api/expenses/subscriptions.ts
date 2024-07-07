import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";

export const useExpenseSubscription = (group_id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const expenseSubscription = supabase
      .channel("table-filter-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: "group_id=eq." + group_id,
        },
        (payload) => {
          // console.log('Change received!', payload);
          queryClient.invalidateQueries(["expenses", group_id]);
          queryClient.invalidateQueries(["groups"]);
        },
      )
      .subscribe();

    return () => {
      expenseSubscription.unsubscribe();
    };
  }, [group_id, queryClient]);
};
