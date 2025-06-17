import { supabase } from "@/src/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useTransferList = (group_id: number) => {
  return useQuery({
    queryKey: ["transfers", group_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select("*")
        .eq("group_id", group_id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
      if (error) {
        console.log("useTransferList error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("Transfer data is ", data);
      return data;
    },
  });
};
