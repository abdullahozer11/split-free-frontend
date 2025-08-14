import { supabase } from "@/src/lib/supabase";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useMemberList = (groupId: number) => {
  return useQuery({
    queryKey: ["members", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, profile")
        .eq("group_id", groupId);
      if (error) {
        console.log("useMemberList error: ", error.message);
        throw new Error(error.message);
      }
      // console.log("useMemberList success: ", data);
      return data;
    },
  });
};

export const useMember = (memberId: number) => {
  return useQuery({
    queryKey: ["member", memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*, group:group_id(title), profile(email, avatar_url)")
        .eq("id", memberId)
        .single();
      if (error) {
        console.log("useMember error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('useMember success: ', data);
      return data;
    },
  });
};

export const useProfileMember = (profileId: string, groupId: number) => {
  return useQuery({
    queryKey: ["profileMember", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id")
        .eq("profile", profileId)
        .eq("group_id", groupId)
        .maybeSingle();
      if (error) {
        console.log("useProfileMember error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('useProfileMember success: ', data);
      return data;
    },
    enabled: !!profileId && !!groupId, // Ensure the query is only enabled when both profileId and groupId are defined
  });
};

export const useUpdateMemberName = () => {
  return useMutation({
    async mutationFn({ name, member_id }) {
      const { error } = await supabase
        .from("members")
        .update({ name })
        .eq("id", member_id)
        .select()
        .single();
      if (error) {
        console.log("useUpdateMemberName error: ", error);
        throw new Error(error.message);
      }
      // console.log("member name is updated");
    },
  });
};

export const useInsertMember = () => {
  return useMutation({
    async mutationFn({ name, group_id }) {
      const { error } = await supabase
        .from("members")
        .insert({ name, group_id });
      if (error) {
        console.log("useInsertMember error: ", error);
        throw new Error(error.message);
      }
      // console.log("useInsertMember success");
    },
  });
};

export const useDeleteMember = () => {
  return useMutation({
    async mutationFn(memberId) {
      // First, check if member is involved in any expenses
      const { data: expenses, error: expenseError } = await supabase
        .from("expenses")
        .select(
          "id, payers:expense_payers(member), participants:expense_participants(member)"
        )
        .eq("settled", false);

      if (expenseError) {
        console.log("useDeleteMember expense check error: ", expenseError);
        throw new Error(`Failed to check member dependencies: ${expenseError.message}`);
      }

      // If member is found in any expenses, prevent deletion
      if (expenses && expenses.length > 0) {
        const memberExpenses = expenses.filter(expense => {
          const isInPayers = expense.payers?.some(payer => payer.member === memberId);
          const isInParticipants = expense.participants?.some(participant => participant.member === memberId);
          return isInPayers || isInParticipants;
        });

        if (memberExpenses.length > 0) {
          const expenseIds = memberExpenses.map(expense => expense.id).join(", ");
          throw new Error(
            `Cannot delete member: they are involved in ${memberExpenses.length} unsettled expense(s) (IDs: ${expenseIds}). Please remove or settle them from all expenses first.`
          );
        }
      }

      // If no dependencies found, proceed with deletion
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", memberId);

      if (error) {
        console.log("useDeleteMember error: ", error);
        throw new Error(error.message);
      }

      // console.log("useDeleteMember success");
    },
  });
};
