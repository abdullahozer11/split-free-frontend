import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/src/database.types";

function removeUserMetaData(itemValue: string) {
  let parsedItemValue = JSON.parse(itemValue);

  // Remove properties from the object
  if (parsedItemValue) {
    delete parsedItemValue.user?.identities;
    delete parsedItemValue.user?.user_metadata;
  }
  // Convert the modified object back to a JSON string
  return JSON.stringify(parsedItemValue);
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, removeUserMetaData(value));
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing. Please set EXPO_PUBLIC_SUPABASE_URL in your environment variables.");
}

if (!supabaseAnonKey) {
  throw new Error("Supabase anonymous key is missing. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
}

console.log("supabaseUrl is", supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
