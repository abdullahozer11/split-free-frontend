# Learnings

## Supabase agent skills

- Installed at project scope with `npx skills add supabase/agent-skills --skill '*' -a grok -a gemini-cli -y`.
- Canonical files live in `.agents/skills/`. `.grok/skills/` holds relative symlinks so Grok's native skill path also resolves.
- `skills-lock.json` pins content hashes. Refresh later with `npx skills update`.
- Skills cover Auth, Realtime, Edge Functions, CLI/MCP, RLS, and Postgres schema/index/query guidance — the areas this app actually uses.

## Supabase realtime channels

- `supabase.channel(name)` returns the existing channel for that topic. After `subscribe()`, adding another `postgres_changes` listener throws `cannot add postgres_changes callbacks ... after subscribe()`.
- Every hook must use a unique channel name (do not share `table-filter-changes`). Cleanup with `supabase.removeChannel()` so React remounts can recreate the channel.
- The same hook on two stacked screens (group details + Statistics) also collides if the topic is only `table:filter`. Include a per-instance suffix (`useId()`) so each subscriber gets its own channel.
- Skip subscribe when filter ids are missing (`session?.user.id`, `group_id`).
- TanStack Query v5 invalidation is `invalidateQueries({ queryKey })`, not `invalidateQueries(["key"])`.

## update_group RPC signature (PGRST202)

- PostgREST matches RPCs by **named argument set**, not by function name alone. Omitting a required arg yields `PGRST202` ("Could not find the function … in the schema cache") even when the function exists. The `hint` lists the names it *does* know, alphabetically.
- Hosted `public.update_group` requires `currency_input` (plus `description_input`, `group_id_input`, `member_names_input`, `title_input`). `create_group` already takes `currency_input`; groups store `currency`. The update screen must send the current currency even if the UI does not edit it.
- `CREATE OR REPLACE FUNCTION` cannot add an argument. Drop every `public.update_group` overload, then create the five-argument function, re-grant `EXECUTE`, and `NOTIFY pgrst, 'reload schema'`.

## group_invitations Data API exposure

- `PGRST205` ("Could not find the table 'public.group_invitations' in the schema cache") is a PostgREST schema-cache miss, not an RLS empty result. The hosted project still had `groups` / `invite_tokens` / `friend_requests` on the Data API while `group_invitations` did not.
- New tables (and tables whose grants were revoked) need explicit `GRANT` to `anon` / `authenticated` plus RLS. Then `NOTIFY pgrst, 'reload schema'` so the Data API caches the table.
- Friend-to-group invites still use `group_invitations`; token invite links use `invite_tokens`. Both must stay in the schema.

## Supabase env var names

- Expo inlines `EXPO_PUBLIC_*` from `.env` at bundle time. `createClient` in `src/lib/supabase.ts` requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- A mismatched name (`EXPO_PUBLIC_SUPABASE_KEY` or `EXPO_PUBLIC_SUPABASE_ANON`) becomes `""` and supabase-js throws `supabaseKey is required`. Keep `.env.sample` in sync with the code.

## Infinite query consumers

- `useExpenseList` and `useTransferList` return TanStack Query infinite-query data (`{ pages, pageParams }`), not a flat row array.
- Screens that aggregate or render the full list must flatten with `data?.pages.flat() ?? []`. Treating `data` as an array makes `.length` undefined and totals/charts render as empty (the Statistics screen bug).
- Do not drain `useExpenseList` pages on Statistics or treat `hasNextPage` as a loading gate. That query is shared with group details (`staleTime` 0), so mount refetch + `fetchNextPage` can leave `hasNextPage` true and spin forever. Stats uses `useExpenseListAll` (`["expenses", groupId, "all"]`) instead.

## Expo SDK 54 upgrade (from 51)

- Jumping SDK 51 → 54 also moves React 18.2 → 19.1 and React Native 0.74 → 0.81. `npx expo install expo@^54.0.0 --fix` updates `package.json`, but a single `npm install` can fail on mixed React 18/19 peer ranges. Installing with `legacy-peer-deps` (project `.npmrc`) is required for `npm ci` as well.
- NativeWind v2 (`nativewind/babel` as a plugin, no CSS file) does not work on SDK 54. The working path is NativeWind **v4.2.x** + Tailwind **3.4.17**, Metro `withNativeWind`, `global.css` imported from `src/app/_layout.tsx`, and `react-native-reanimated` **v4** plus `react-native-worklets`.
- Expo Router 6 depends on React Navigation **7**. Leaving `@react-navigation/native` at v6 as a direct dependency can hoist the wrong version.
- SDK 54 minimum Node is **20.19.4**. New Architecture is the default; JSC is gone.

## Deprecated React Native SafeAreaView

- Importing `SafeAreaView` from `react-native` hits a getter that `warnOnce`s: "SafeAreaView has been deprecated... use react-native-safe-area-context".
- Use `SafeAreaView` / `useSafeAreaInsets` from `react-native-safe-area-context` (already a dependency). Expo Router supplies `SafeAreaProvider`.
- `no-restricted-imports` in `eslint.config.js` blocks the core export.

## Paper Text on dark headers

- `react-native-paper` `Text` sets `color` from `theme.colors.onSurface` (dark in the light theme). NativeWind `className="text-white"` on the `Translated` wrapper does not override that style.
- On black collapsible headers and the account profile header, pass `style={{ color: "#FFFFFF" }}` so the title stays readable.
- `CollapsibleHeader` used `p-10` plus `overflow-hidden`. That padding consumed most of the min height and clipped the group name; keep padding in the header content and pin the title with `flex-1 justify-end` so collapse shrinks the spacer, not the title.
