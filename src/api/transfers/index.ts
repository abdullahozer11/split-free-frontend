import { supabase } from "@/src/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export const useTransferList = (group_id: number) => {
  return useInfiniteQuery({
    queryKey: ["transfers", group_id],
    queryFn: async ({ pageParam }) => {
      try {
        const page = pageParam ?? 0;
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from("transfers")
          .select("*")
          .eq("group_id", group_id)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to);
        if (error) {
          console.error("useTransferList query error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          throw new Error(`Failed to fetch transfers: ${error.message}`);
        }
        return data;
      } catch (err) {
        console.error("useTransferList unexpected error:", err);
        throw new Error(
          `Unexpected error fetching transfers: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage?.length === PAGE_SIZE) {
        return lastPageParam + 1;
      }
      return undefined;
    },
  });
};

export const useTransfer = (id: number) => {
  return useQuery({
    queryKey: ["transfer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select(
          `
          created_at,
          amount,
          sender: sender (name),
          receiver: receiver (name)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("useTransfer fetch error:", error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("Transfer not found");
      }

      return {
        created_at: data.created_at,
        amount: data.amount,
        sender: data.sender.name,
        receiver: data.receiver.name,
      };
    },
  });
};
