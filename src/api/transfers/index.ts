import {useMutation} from "@tanstack/react-query";
import {supabase} from "@/src/lib/supabase";

export const useInsertTransfer = () => {
  return useMutation({
    async mutationFn(transfer) {
      const {error} = await supabase
        .from('transfers')
        .insert(transfer);
      if (error) {
        console.error('useInsertTransfer error: ', error.message);
        throw new Error(error.message);
      }
      // console.log('useInsertTransfer success');
      return;
    },
  });
};
