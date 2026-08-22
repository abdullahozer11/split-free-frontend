import { supabase } from "@/src/lib/supabase";

export const generateInvite = async (groupId: number) => {
  const { data: token, error } = await supabase.rpc("generate_invite_token", {
    group_id_input: groupId,
  });

  if (error) {
    console.error("Error generating invite:", error);
    throw error;
  }

  if (!token) {
    throw new Error("Failed to generate invite token.");
  }

  // Deep link: token only. Group id is resolved server-side on join.
  const inviteLink = `https://split-free-next.vercel.app/join?token=${token}`;
  return inviteLink;
};
