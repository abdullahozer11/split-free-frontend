import {supabase} from "@/src/lib/supabase";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";


export const useExpenseList = (group_id: number) => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('expenses')
        .select('id, title, amount, created_at')
        .eq('group_id', group_id);
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      // console.log("Expense data is ", data);
      return data;
    },
  });
};

export const useExpense = (id: number) => {
  if (!id) {
    return null;
  }
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('expenses')
        .select('*, expense_payers(member), expense_participants(member)')
        .eq('id', id)
        .single();
      if (error) {
        // console.log(error.message);
        throw new Error(error.message);
      }
      // console.log(data);
      return data;
    }
  });
};

export const useInsertExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data) {
      console.log("data is ", data)
      const {data: newExpenseID, error} = await supabase
        .rpc('create_expense', {
          amount_input: data.amount,
          currency_input: data.currency,
          date_input: data.date,
          description_input: data.description,
          group_id_input: data.group_id,
          participants_input: data.participants,
          payers_input: data.payers,
          proof_input: data.proof,
          title_input: data.title,
        });
      if (error) {
        console.error('Error during insertion:', error);
        throw new Error(error.message);
      }
      console.log('New expense inserted:', newExpenseID);
      return newExpenseID;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['expenses']);
    }
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: updatedExpense} = await supabase
        .from('expenses')
        .update({
          id: data.id,
          amount_input: data.amount,
          currency_input: data.currency,
          date_input: data.date,
          description_input: data.description,
          group_id_input: data.group_id,
          participants_input: data.participants,
          payers_input: data.payers,
          proof_input: data.proof,
          title_input: data.title,
        })
        .eq('id', data.id)
        .select()
        .single();
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      console.log(updatedExpense);
      return updatedExpense;
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['expenses']);
      await queryClient.invalidateQueries(['expenses', id]);
    }
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(id: number) {
      const {error} = await supabase.from('expenses').delete().eq('id', id);
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['expenses']);
    }
  });
};

export const useDeletePayer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(payer) {
      // console.log("payer to be deleted is ", payer);
      const {error} = await supabase.from('expense_payers')
        .delete()
        .eq('member', payer.member)
        .eq('expense', payer.expense);
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['expense_payers']);
    }
  });
};

export const useDeleteParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(participant) {
      const {error} = await supabase.from('expense_participants')
        .delete()
        .eq('member', participant.member)
        .eq('expense', participant.expense);
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['expense_participants']);
    }
  });
};
