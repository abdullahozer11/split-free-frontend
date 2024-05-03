import {useQuery} from "@tanstack/react-query/build/modern";
import {supabase} from "@/src/lib/supabase";

// export const useMemberBalance = (memberId: number) => {
//   return useQuery({
//     queryKey: ['members', memberId],
//     queryFn: async () => {
//       const {data, error} = await supabase
//         .from('members')
//         .select('total_balance')
//         .eq('id', memberId);
//       if (error) {
//         console.log(error.message);
//         throw new Error(error.message);
//       }
//       console.log("Member total balance is ", data);
//       return data;
//     },
//   });
// };
