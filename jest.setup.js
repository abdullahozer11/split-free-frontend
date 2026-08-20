const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");
const InMemoryStorageAdapter = require("./__tests__/InMemoryStorageAdapter");

const LOCAL_URL = "http://127.0.0.1:54321";
const LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || LOCAL_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || LOCAL_ANON_KEY;

const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(
  supabaseUrl,
);
if (!isLocal) {
  throw new Error(
    `Supabase tests must use a local URL (got ${supabaseUrl}). Start the stack with \`npx supabase start\` and run \`npm run test:supabase\`.`,
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new InMemoryStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Node 20 has no global WebSocket; supabase-js still constructs RealtimeClient.
  realtime: { transport: WebSocket },
});

module.exports = { supabase };
