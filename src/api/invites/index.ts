import { supabase } from "@/src/lib/supabase";
import * as Crypto from "expo-crypto";

// This allows the backend (Next.js site) to handle redirection or deep linking based on the app variant/bundle (e.g., development, preview, production).
export const generateInvite = async (groupId: number) => {
  const variant = process.env.EXPO_PUBLIC_APP_VARIANT;
  let packageId = "xyz.splitfree";
  if (variant === "development") {
    packageId += ".dev";
  } else if (variant === "preview") {
    packageId += ".preview";
  }

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

  // Deep link: Include token and packageId for backend handling of different bundles
  const inviteLink = `https://split-free-next.vercel.app/join?token=${token}&package=${packageId}`;
  return inviteLink; // Use this for QR code or sharing
};
