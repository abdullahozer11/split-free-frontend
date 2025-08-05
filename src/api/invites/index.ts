import { supabase } from "@/src/lib/supabase";
import * as Crypto from "expo-crypto";

export const generateInvite = async (groupId: number) => {
  const token = Crypto.randomUUID(); // Generates a random UUID v4 string
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Optional: Expires in 7 days

  const {error} = await supabase
    .from('invite_tokens')
    .insert({
      group_id: groupId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error generating invite:', error);
    throw error;
  }

  // Deep link: Use token only, or include group_id if you want
  const inviteLink = `xyz.splitfree://join?token=${token}`;
  return inviteLink; // Use this for QR code or sharing
};
