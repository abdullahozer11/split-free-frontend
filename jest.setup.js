// jest.setup.js
import { Database } from "@/src/database.types";
const { createClient } = require("@supabase/supabase-js");
const InMemoryStorageAdapter = require("./__tests__/InMemoryStorageAdapter");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  createClient <
  Database >
  (supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: new InMemoryStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

module.exports = { supabase };
