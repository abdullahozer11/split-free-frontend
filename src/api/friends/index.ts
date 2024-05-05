import {supabase} from "@/src/lib/supabase";
import {useQuery} from "@tanstack/react-query";

export const useSearchQuery = (email: string) => {
  return useQuery({
    queryKey: ['search', email],
    queryFn: async () => {
      const {data: searchResults, error} = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', `%${email}%`)
        .limit(10);
      if (error) {
        console.log("error is ", error.message);
        throw new Error(error.message);
      }
      console.log("Search results are ", searchResults);
      return searchResults;
    }
  });
};
