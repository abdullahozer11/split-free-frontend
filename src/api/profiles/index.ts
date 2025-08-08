import { supabase } from "@/src/lib/supabase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uuid } from "expo-modules-core";

export const useUpdateProfile = () => {
  return useMutation({
    async mutationFn(profile) {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);
      if (error) {
        console.log("useUpdateProfile error: ", error);
        throw new Error(error.message);
      }
      // console.log("updatedProfile success: ");
    },
  });
};

export const useProfile = (uid) => {
  return useQuery({
    queryKey: ["profile", uid],  // Include uid in queryKey for proper caching
    enabled: !!uid,  // Prevent query from running if uid is undefined
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (error) {
        console.log("useProfile error is ", error.message);
        throw new Error(error.message);
      }
      return profile;
    },
  });
};


export const useAssignMember = () => {
  return useMutation({
    async mutationFn(data) {
      const { error } = await supabase.rpc("self_assign_to", data);
      if (error) {
        console.error("useAssignMember error: ", error.message);
        throw new Error(error.message);
      }
      // console.log('useAssignMember success');
    },
  });
};

export const useUpdateProfileSingleField = () => {
  return useMutation({
    mutationFn: async ({ id, field, value }) => {
      const updates = {};
      updates[field] = value;
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);
      if (error) {
        console.log("useUpdateProfileSingleField error: ", error);
        throw new Error(error.message);
      }
      // console.log("useUpdateProfileSingleField success");
    },
  });
};
