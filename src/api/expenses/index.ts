import {supabase} from "@/src/lib/supabase";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";


export const useExpenseList = ({group_id}) => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('expenses')
        .select('*')
        .eq('group', group_id);
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      console.log(data);
      return data;
    },
  });
};

export const useExpense = (id: number) => {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      console.log(data);
      return data;
    }
  });
};

export const useInsertExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: newExpense} = await supabase
        .from('expenses')
        .insert({
          amount: data.amount,
          currency: data.currency,
          date: data.date,
          description: data.description,
          group: data.group,
          title: data.title,
        })
        .select()
        .single();
      if (error) {
        console.error('Error during insertion:', error);
        throw new Error(error.message);
      }
      return newExpense;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['expenses']);
    }
  });
};

export const useBulkInsertPayers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: newPayers} = await supabase
        .from('expense_payers')
        .insert(data);
      if (error) {
        console.error('Error during insertion:', error);
        throw new Error(error.message);
      }
      // console.log(newPayers);
      return newPayers;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['expense_payers']);
    }
  });
};

export const useBulkInsertParticipants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: newParticipants} = await supabase
        .from('expense_participants')
        .insert(data);
      if (error) {
        console.error('Error during insertion:', error);
        throw new Error(error.message);
      }
      // console.log(newParticipants);
      return newParticipants;
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['expense_participants']);
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
          name: data.name,
        })
        .eq('id', data.id)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
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
