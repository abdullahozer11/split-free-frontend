import { supabase } from "@/src/lib/supabase";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;
const EXPENSE_LIST_SELECT =
  "id, title, amount, date, created_at, group_id, category, settled, " +
  "payers:expense_payers(member), participants:expense_participants(member)";

export const useLatestExpense = (group_id: number, enabled = true) => {
  return useQuery({
    queryKey: ["expenses", group_id, "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          "id, created_at, payers:expense_payers(member), participants:expense_participants(member)",
        )
        .eq("group_id", group_id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("useLatestExpense query error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Failed to fetch latest expense: ${error.message}`);
      }
      return data;
    },
    enabled: !!group_id && enabled,
  });
};

export const useExpenseList = (group_id: number) => {
  return useInfiniteQuery({
    queryKey: ["expenses", group_id],
    queryFn: async ({ pageParam }) => {
      try {
        const page = pageParam ?? 0;
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from("expenses")
          .select(EXPENSE_LIST_SELECT)
          .eq("group_id", group_id)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to);
        if (error) {
          console.error("useExpenseList query error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          throw new Error(`Failed to fetch expenses: ${error.message}`);
        }
        return data;
      } catch (err) {
        console.error("useExpenseList unexpected error:", err);
        throw new Error(`Unexpected error fetching expenses: ${err.message}`);
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

export const useExpenseListAll = (group_id: number) => {
  return useQuery({
    queryKey: ["expenses", group_id, "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(EXPENSE_LIST_SELECT)
        .eq("group_id", group_id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
      if (error) {
        console.error("useExpenseListAll query error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Failed to fetch expenses: ${error.message}`);
      }
      return data ?? [];
    },
    enabled: Number.isFinite(group_id),
  });
};

export const useExpense = (id: number) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      // Fetch expense details
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .select(
          "amount, id, title, settled, description, date, last_modified, group_id, category",
        )
        .eq("id", id)
        .single();

      if (expenseError) {
        console.log("useExpense expense error: ", expenseError.message);
        throw new Error(expenseError.message);
      }

      // Fetch payers
      const { data: payersData, error: payersError } = await supabase
        .from("expense_payers")
        .select(
          `
          member (
            id,
            name,
            profile (
              avatar_url
            )
          )
        `,
        )
        .eq("expense", id);

      if (payersError) {
        console.log("useExpense payers error: ", payersError.message);
        throw new Error(payersError.message);
      }

      const payers = payersData
        ? payersData.map((item) => ({
            id: item.member.id,
            name: item.member.name,
            avatar_url: item.member.profile
              ? item.member.profile.avatar_url
              : null,
          }))
        : [];

      // Fetch payer_ids
      const { data: payerIdsData, error: payerIdsError } = await supabase
        .from("expense_payers")
        .select("member")
        .eq("expense", id);

      if (payerIdsError) {
        console.log("useExpense payer_ids error: ", payerIdsError.message);
        throw new Error(payerIdsError.message);
      }

      const payer_ids = payerIdsData ? payerIdsData.map((d) => d.member) : [];

      // Fetch participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("expense_participants")
          .select(
            `
          member (
            id,
            name,
            profile (
              avatar_url
            )
          )
        `,
          )
          .eq("expense", id);

      if (participantsError) {
        console.log(
          "useExpense participants error: ",
          participantsError.message,
        );
        throw new Error(participantsError.message);
      }

      const participants = participantsData
        ? participantsData.map((item) => ({
            id: item.member.id,
            name: item.member.name,
            avatar_url: item.member.profile
              ? item.member.profile.avatar_url
              : null,
          }))
        : [];

      // Fetch participant_ids
      const { data: participantIdsData, error: participantIdsError } =
        await supabase
          .from("expense_participants")
          .select("member")
          .eq("expense", id);

      if (participantIdsError) {
        console.log(
          "useExpense participant_ids error: ",
          participantIdsError.message,
        );
        throw new Error(participantIdsError.message);
      }

      const participant_ids = participantIdsData
        ? participantIdsData.map((d) => d.member)
        : [];

      // Build the response object
      const expense = {
        amount: expenseData.amount,
        id: expenseData.id,
        title: expenseData.title,
        settled: expenseData.settled,
        description: expenseData.description,
        date: expenseData.date,
        last_modified: expenseData.last_modified,
        group_id: expenseData.group_id,
        category: expenseData.category,
        payers,
        participants,
        payer_ids,
        participant_ids,
      };

      // console.log("expense is ", expense);
      return expense;
    },
  });
};

export const useInsertExpense = () => {
  return useMutation({
    async mutationFn(data) {
      const { data: newExpenseID, error } = await supabase.rpc(
        "create_expense",
        {
          amount_input: data.amount,
          date_input: data.date,
          category_input: data.category,
          description_input: data.description,
          group_id_input: data.group_id,
          participants_input: data.participants,
          payers_input: data.payers,
          proof_input: data.proof,
          title_input: data.title,
        },
      );
      if (error) {
        console.error("useInsertExpense error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('New expense inserted:', newExpenseID);
      return newExpenseID;
    },
  });
};

export const useUpdateExpense = () => {
  return useMutation({
    async mutationFn(data) {
      const { error } = await supabase.rpc("update_expense", {
        expense_id: data.id,
        amount_input: data.amount,
        category_input: data.category,
        date_input: data.date,
        description_input: data.description,
        participants_input: data.participants,
        payers_input: data.payers,
        proof_input: data.proof,
        title_input: data.title,
      });
      if (error) {
        console.error("Error during update:", error.message);
        throw new Error(error.message);
      }
      // console.log('Expense is updated:', newExpense);
      return;
    },
  });
};

export const useDeleteExpense = () => {
  return useMutation({
    async mutationFn(id: bigint) {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) {
        console.error("useDeleteExpense error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('Expense is deleted');
      return;
    },
  });
};

export const useSettleExpense = () => {
  return useMutation({
    async mutationFn(expense) {
      const { error } = await supabase.rpc("settle_expense", {
        expense_id: expense.id,
        _group_id: expense.group_id,
      });
      if (error) {
        console.error("useSettleExpense error: ", error.message);
        throw new Error(error.message);
      }
      console.log("useSettleExpense success");
      return;
    },
  });
};

export const useExpenseTotalThisMonth = (group_id: number) => {
  return useQuery({
    queryKey: ["expense_total_month", group_id],
    queryFn: async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          .toISOString()
          .split("T")[0];
        const { data, error } = await supabase
          .from("expenses")
          .select("amount")
          .eq("group_id", group_id)
          .gte("date", startOfMonth)
          .lt("date", endOfMonth);
        if (error) {
          console.error("useExpenseTotalThisMonth query error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          throw new Error(
            `Failed to fetch monthly expense total: ${error.message}`,
          );
        }
        const total = data
          .reduce((sum, item) => sum + item.amount, 0)
          .toFixed(2);
        return total;
      } catch (err) {
        console.error("useExpenseTotalThisMonth unexpected error:", err);
        throw new Error(
          `Unexpected error fetching monthly expense total: ${err.message}`,
        );
      }
    },
  });
};
