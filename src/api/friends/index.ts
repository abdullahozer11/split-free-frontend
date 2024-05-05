import {supabase} from "@/src/lib/supabase";
import {useQuery} from "@tanstack/react-query";

export const useSearchQuery = (name: string) => {
  return useQuery({
    queryKey: ['search', name],
    queryFn: async () => {
      const {data: searchResults, error} = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', `%${name}%`)
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
