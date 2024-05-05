import {supabase} from "@/src/lib/supabase";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const {error, data: updatedProfile} = await supabase
        .from('profiles')
        .update({
          avatar_url: data.avatar_url,
          full_name: data.full_name,
          phone_number: data.phone_number,
          website: data.website,
        })
        .eq('id', data.id)
        .select()
        .single();
      if (error) {
        console.log("error is ", error);
        throw new Error(error.message);
      }
      console.log("updatedProfile: ", updatedProfile);
      return updatedProfile;
    },
    async onSuccess(_, {id}) {
      await queryClient.invalidateQueries(['profile']);
    }
  });
};

export const useProfile = (uid) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {data: profile , error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      if (error) {
        console.log(error.message);
        throw new Error(error.message);
      }
      // console.log("Fetched profile is :", profile);
      return profile;
    }
  });
};
