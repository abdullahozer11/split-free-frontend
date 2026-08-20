# Learnings

## Auth forms and the software keyboard (Expo SDK 54)

- Centered `flex-1 justify-center` auth screens do not move when the keyboard opens. SDK 54 Android is edge-to-edge, so `adjustResize` no longer shrinks the window (it behaves like `adjustNothing`). iOS overlays the keyboard unless the view adds padding.
- Use `KeyboardAvoidingView` (`padding` on iOS, `height` on Android) plus a `ScrollView` with `flexGrow` + `justifyContent: "center"`. Offset iOS by `useHeaderHeight()`. Do not add `react-native-keyboard-controller` unless the app is on a custom dev client again; Expo Go cannot load it.
- `softwareKeyboardLayoutMode: "pan"` is for tab screens that get pushed above the keyboard. Leave the default on auth (no tabs).


## Dependabot npm alerts on Expo SDK 54

- `npm audit fix --force` wants Expo 57. Stay on SDK 54 and pin patched transitives with `package.json` `overrides`.
- Direct `ws` (Jest Realtime transport) must be `>= 8.21.1` (`8.18.3` is the uninitialized-memory and fragment-DoS range). Do **not** globally override `ws`: React Native still needs `ws@6` / `ws@7`.
- `postcss` `>= 8.5.23` covers the sourceMappingURL file-read chain and `</style>` stringify XSS. Tailwind 3.4 accepts PostCSS 8.5.
- `react-native-markdown-display` still depends on `markdown-it@^10`. Override `markdown-it` to `14.3.0` (CJS `require` still works; default `{ typographer: true }` is the smartquotes DoS path) and `linkify-it` to `5.0.2`.
- `xcode` uses `require('uuid').v4()`. Override to `uuid@11.1.1` (CJS `exports.node.require`). Do not use 13+/14 (ESM-only).
- `image-size` has **no published patch** (`2.0.3` never shipped; upstream archived). `@expo/metro` 54 pulls `metro@0.83.3` which still depends on it. Override the `metro@0.83.*` family to `0.83.8` (already used by RN 0.81.5; inlined image parsing). That is the only way to drop `image-size` from the lockfile so Dependabot can close those alerts.

## Preview APK is manual, not a PR check

- Testers need an installable APK rarely. Do not put `eas build` on `pull_request` or `push`. Use `workflow_dispatch` (Actions → Preview APK → Run workflow) so PR CI stays Jest / local Supabase / typecheck / lint.
- The GitHub job only *triggers* EAS (`--non-interactive --no-wait`). Gradle runs on Expo's builders; Codespaces should not compile Android.
- `.env` is gitignored, so EAS would not see local env. The workflow copies `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from GitHub secrets into `eas.json` `build.preview.env` for that run. Also set `EXPO_TOKEN`.

## Local Supabase complete_flow in CI

- `complete_flow` is the product contract (group RPC, expense create/update/delete, debt math, settle). Gate it with `npm run test:supabase` against **local** `supabase start`, never the hosted project. `jest.config.js` must not inject `EXPO_PUBLIC_SUPABASE_*` hosted defaults.
- `create_group` requires `currency_input`. `create_expense` does not take `currency_input` (dropped in the efficiency migration); extra RPC args yield `PGRST202`.
- `auth.getSession()` returns `{ session: null }`, not `data: null`. `deleteuser` does not clear the client session; assert a later password sign-in fails.
- Look up members by `name`, not array index. `config.toml` seed path must exist (`supabase/seed.sql`) or `supabase start` / `db reset` fails.
- `handle_new_user()` existed in the dumped schema without a trigger on `auth.users`. Local sign-up then skips `public.profiles` and `create_group` fails with `public_groups_owner_fkey`. Attach `on_auth_user_created`.
- CI Node is 20.19.4 (no global `WebSocket`). `createClient` still constructs RealtimeClient, so `jest.setup.js` must pass `realtime.transport` from `ws`.

## CI typecheck scope

- Full-app `tsc --noEmit` still fails on loosely typed group, friends, and join screens. Do not gate PRs on `tsconfig.json` until those files are typed. Expand `tsconfig.typecheck.json` one batch at a time.
- `npm run typecheck` covers `src/api`, `src/lib`, `src/constants`, `src/database.types.ts`, `expenseFormDefaults`, `expense_categories`, `helpers`, providers, the translation catalog, typed wrappers (`Translated`, `Button`, `KeyboardAvoidingScreen`), shared UI (`GroupItem`, `ExpenseItem`, `TransferItem`, `Person`, dropdowns, headers), `ExpenseForm`, group create modals, and auth/account/global screens. Mutation hooks must take explicit variables so `useMutation` is not inferred as `void`.
- Interval timers need `ReturnType<typeof setInterval>`. Expo Router `href` template strings only typecheck when the page segment is a literal union. Profile `language` is `string | null` in the DB — narrow with `isLanguage` before writing `Settings.language`.
- `useState([])` infers `never[]`. Give member-name lists an explicit `string[]` bound. RPC optional text args are `string | undefined`, not `null` — omit `proof` / empty `description` instead of passing `null`.
- Category dropdown `labelField` is an `ExpenseCategory` key. `Language` includes `de` and the catalog does not; map `de` to `en`. Missing catalog keys (`Select a category`) must go through `t()`, not `dictionary[key]`.
- List-row props should be view models (selected query columns), not full `Tables["…"]["Row"]`. Nested `profile(...)` selects are objects; the members table `profile` column is a UUID.
- Paper `Text` has no `color` prop — use `style={{ color }}`. `MultiSelect` `renderRightIcon` must return `ReactElement | null`, not `false && <El/>`.
- `exp_cats[].icon` must be a `MaterialIcons` glyph name or `ExpenseItem` cannot pass it to `name`.
- Date helpers must type `toLocaleDateString` options as `Intl.DateTimeFormatOptions` (or `as const`). Bare `{ year: "numeric" }` infers `string` and misses the overload.
- Empty-array defaults on untyped `mergeActivityWithFrontier` args infer `never[]`, so spreading a row is TS2698. Give the merge args an `ActivityRecord` bound (and default `= {}` on the object, not `= []` on the generic).
- GitHub Actions Node must match `engines.node` (`>=20.19.4`). Pin via `.nvmrc` (`20.19.4`), not `node-version: 20`.

## Translation catalog and wrappers

- Keep the English-as-key catalog (`src/translations/index.ts`). 169 keys × 8 locales is too small to justify i18next; typed `Language` / `getDictionary` / `lookupMessage` is enough.
- `SettingsProvider` must be TypeScript. A JS provider makes `settings.language` `any`, which then cannot index the catalog (TS7053) and poisons every `translations[settings.language]` call site.
- `Translated.tsx` wrappers must use `ComponentProps` of the Paper / Expo component. Untyped destructuring makes every named prop required, and `cssInterop` drops `TextInput.Icon` / `Affix` unless they are reattached on a typed object.
- Do not call `useSettings()` inside `Alert.alert` / `prompt`. Those are not components. Keep the active locale in `setActiveLanguage` from the provider and read it with `getActiveDictionary()`.
- Paper `TextInput` `error` is a boolean. Do not pass a translated string through as `error`.

## Supabase agent skills

- Installed at project scope with `npx skills add supabase/agent-skills --skill '*' -a grok -a gemini-cli -y`.
- Canonical files live in `.agents/skills/`. `.grok/skills/` holds relative symlinks so Grok's native skill path also resolves.
- `skills-lock.json` pins content hashes. Refresh later with `npx skills update`.
- Skills cover Auth, Realtime, Edge Functions, CLI/MCP, RLS, and Postgres schema/index/query guidance — the areas this app actually uses.

## Supabase realtime channels

- `supabase.channel(name)` returns the existing channel for that topic. After `subscribe()`, adding another `postgres_changes` listener throws `cannot add postgres_changes callbacks ... after subscribe()`.
- `removeChannel()` only teardowns after `unsubscribe()` resolves, so the old topic is still in `getChannels()` during React remounts (Strict Mode, sign-in redirect onto Groups). A stable `useId()` suffix is not enough.
- Generate the topic inside the effect (`realtimeTopic(prefix)` in `src/lib/realtime.ts`) so each `subscribe()` gets a new name. Cleanup with `supabase.removeChannel()`.
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
- Default `SafeAreaView` insets include `bottom`. On a tab screen that already has a tab bar, that extra padding plus a non-content background (`bg-black` on Account) shows as a colored strip above the tabs. Pass `edges={["top"]}` when only the status bar needs insetting.

## NativeWind className on third-party components

- NativeWind v4 only maps `className` onto React Native core views. `react-native-element-dropdown` (`Dropdown`, `MultiSelect`) ignores it, so `flex-1`, `bg-white`, and `mt-[30px]` never applied. Style those with the library's `style` / `placeholderStyle` / `selectedTextStyle` props.
- Paper `Text` still wins on color and alignment over `className`. Use `style` for Save labels and any text that must be centered or tinted.
- Paper `TextInput` is not a core view. Without `cssInterop`, `className` (`bg-white`, `border`) lands on the inner native field. Flat mode still fills the Paper container with MD3 `surfaceVariant` (lavender). A trailing `TextInput.Icon` sits in that gutter, and Paper's `IconButton` can paint its own fill. Map `className` → `style` on the wrapper, default the Paper container to white, make the inner field transparent, and clone icons with `containerColor="transparent"` so the `adornment.type === TextInput.Icon` check still matches.

## Expo Router layout children

- `Stack` layouts keep only children whose type is `Screen` (`child.type === Screen`). Wrappers such as `StackScreen` in `Translated.tsx` are ignored and log: `Layout children must be of type Screen... Update Layout Route at: "app/(tabs)/account/profile/_layout"`.
- In `_layout` files, use `Stack.Screen` and translate titles with `useTranslations()`. Keep `StackScreen` for setting options from inside a screen (auth, not-found).

## Paper Text on dark headers

- `react-native-paper` `Text` sets `color` from `theme.colors.onSurface` (dark in the light theme). NativeWind `className="text-white"` on the `Translated` wrapper does not override that style.
- On black collapsible headers and the account profile header, pass `style={{ color: "#FFFFFF" }}` so the title stays readable.
- `CollapsibleHeader` used `p-10` plus `overflow-hidden`. That padding consumed most of the min height and clipped the group name; keep padding in the header content and pin the title with `flex-1 justify-end` so collapse shrinks the spacer, not the title.
