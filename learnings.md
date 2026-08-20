# Learnings

## Supabase agent skills

- Installed at project scope with `npx skills add supabase/agent-skills --skill '*' -a grok -a gemini-cli -y`.
- Canonical files live in `.agents/skills/`. `.grok/skills/` holds relative symlinks so Grok's native skill path also resolves.
- `skills-lock.json` pins content hashes. Refresh later with `npx skills update`.
- Skills cover Auth, Realtime, Edge Functions, CLI/MCP, RLS, and Postgres schema/index/query guidance — the areas this app actually uses.

## Supabase realtime channels

- `supabase.channel(name)` returns the existing channel for that topic. After `subscribe()`, adding another `postgres_changes` listener throws `cannot add postgres_changes callbacks ... after subscribe()`.
- Every hook must use a unique channel name (do not share `table-filter-changes`). Cleanup with `supabase.removeChannel()` so React remounts can recreate the channel.
- Skip subscribe when filter ids are missing (`session?.user.id`, `group_id`).
- TanStack Query v5 invalidation is `invalidateQueries({ queryKey })`, not `invalidateQueries(["key"])`.

## Supabase env var names

- Expo inlines `EXPO_PUBLIC_*` from `.env` at bundle time. `createClient` in `src/lib/supabase.ts` requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- A mismatched name (`EXPO_PUBLIC_SUPABASE_KEY` or `EXPO_PUBLIC_SUPABASE_ANON`) becomes `""` and supabase-js throws `supabaseKey is required`. Keep `.env.sample` in sync with the code.

## Expo SDK 54 upgrade (from 51)

- Jumping SDK 51 → 54 also moves React 18.2 → 19.1 and React Native 0.74 → 0.81. `npx expo install expo@^54.0.0 --fix` updates `package.json`, but a single `npm install` can fail on mixed React 18/19 peer ranges. Installing with `legacy-peer-deps` (project `.npmrc`) is required for `npm ci` as well.
- NativeWind v2 (`nativewind/babel` as a plugin, no CSS file) does not work on SDK 54. The working path is NativeWind **v4.2.x** + Tailwind **3.4.17**, Metro `withNativeWind`, `global.css` imported from `src/app/_layout.tsx`, and `react-native-reanimated` **v4** plus `react-native-worklets`.
- Expo Router 6 depends on React Navigation **7**. Leaving `@react-navigation/native` at v6 as a direct dependency can hoist the wrong version.
- SDK 54 minimum Node is **20.19.4**. New Architecture is the default; JSC is gone.
