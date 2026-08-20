import { supabase } from "@/src/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useDebt = (memberId: number, profileMemberId: number) => {
  return useQuery({
    queryKey: ["debt", memberId, profileMemberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select()
        .or(`borrower.eq.${memberId},lender.eq.${profileMemberId}`)
        .or(`lender.eq.${memberId},borrower.eq.${profileMemberId}`);
      if (error) {
        console.log("useDebt error: ", error.message);
        throw new Error(error.message);
      }
      if (!data || data.length === 0) {
        // console.log("useDebt: No debts found");
        return null;
      }

      // Pairwise member debt is one row; the details screen reads amount.
      return data[0];
    },
    enabled: !!memberId && !!profileMemberId && memberId !== profileMemberId,
  });
};
