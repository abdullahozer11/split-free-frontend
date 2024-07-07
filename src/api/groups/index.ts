import { supabase } from "@/src/lib/supabase";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useGroupList = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_groups_summary");
      if (error) {
        console.log("useGroupList error", error.message);
        throw new Error(error.message);
      }
      // console.log('useGroupList success', data);
      return data;
    },
  });
};

export const useGroup = (id: number) => {
  return useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const { data: _Group, error } = await supabase
        .from("groups")
        .select(
          "id, owner, title, expense_total, members(id, name, role, total_balance, profile(id, avatar_url)), debts(id, amount, borrower, lender)",
        )
        .eq("id", id)
        .single();
      if (error) {
        console.log("useGroup error: ", error.message);
        throw new Error(error.message);
      }
      return _Group;
    },
  });
};

export const useDeleteGroup = () => {
  return useMutation({
    async mutationFn(id) {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) {
        console.error("useDeleteGroup error:", error);
        throw new Error(error.message);
      }
      // console.log("useDeleteGroup success");
      return id;
    },
  });
};

export const useInsertGroup = () => {
  return useMutation({
    async mutationFn(data) {
      const { data: newGroupID, error } = await supabase.rpc("create_group", {
        member_names_input: data.member_names,
        title_input: data.title,
      });
      if (error) {
        console.error("useInsertGroup error:", error);
        throw new Error(error.message);
      }
      // console.log('useInsertGroup success:', newGroupID);
      return newGroupID;
    },
  });
};

export const useUpdateGroup = () => {
  return useMutation({
    async mutationFn(newGroup) {
      const { error } = await supabase.rpc("update_group", newGroup);
      if (error) {
        console.error("useUpdateGroup error:", error);
        throw new Error(error.message);
      }
    },
  });
};

export const useSettleGroup = () => {
  return useMutation({
    async mutationFn(id) {
      const { error } = await supabase.rpc("settle_group", { _id: id });
      if (error) {
        console.error("useSettleGroup error: ", error.message);
        throw new Error(error.message);
      }
      console.log("useSettleGroup success");
      return;
    },
  });
};

export const useExitGroup = () => {
  return useMutation({
    async mutationFn(data) {
      const { error } = await supabase.rpc("exit_group", data);
      if (error) {
        console.error("useExitGroup error:", error);
        throw new Error(error.message);
      }
      // console.log("useExitGroup success");
      return;
    },
  });
};
