import { supabase } from "@/src/lib/supabase";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

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
          .select(
            "id, title, amount, date, created_at, group_id, category, settled, " +
              "payers:expense_payers(member), participants:expense_participants(member)",
          )
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

export const useExpense = (id: number) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      const { data: expense, error } = await supabase.rpc("use_expense", {
        expense_id_input: id,
      });
      if (error) {
        console.log("useExpense error: ", error.message);
        throw new Error(error.message);
      }
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
          currency_input: data.currency,
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
        currency_input: data.currency,
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
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];
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
          throw new Error(`Failed to fetch monthly expense total: ${error.message}`);
        }
        const total = data.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
        return total;
      } catch (err) {
        console.error("useExpenseTotalThisMonth unexpected error:", err);
        throw new Error(`Unexpected error fetching monthly expense total: ${err.message}`);
      }
    },
  });
};
