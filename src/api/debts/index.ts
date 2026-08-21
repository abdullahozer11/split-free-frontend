import { supabase } from "@/src/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { pairwiseDebtOrFilter } from "@/src/api/debts/pairwise";

export const useDebt = (memberId: number, profileMemberId: number) => {
  return useQuery({
    queryKey: ["debt", memberId, profileMemberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select()
        .or(pairwiseDebtOrFilter(memberId, profileMemberId))
        .maybeSingle();
      if (error) {
        console.log("useDebt error: ", error.message);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!memberId && !!profileMemberId && memberId !== profileMemberId,
  });
};
