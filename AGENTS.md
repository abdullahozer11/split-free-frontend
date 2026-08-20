# Gemini CLI Instructions for split-free-frontend

## 1. Token Efficiency and Helper Files
- Be highly token-efficient in all interactions.
- Utilize helper secondary files to maintain and offload context, such as:
  - `./AGENTS.md`: This file. Versioned with the repo so every clone and Codespace gets the same agent workflow.
  - `./CODEBASE.md`: High-level project overview, directory tree structure, module breakdown, and key architecture/coding conventions (consult this file first to understand the system layout).
  - `./learnings.md`: Dynamic repository learnings, architectural insights, and technical summaries of completed changes (create and commit it when there is something to record).
  - Project hierarchy files or documentation: Use of structured summaries to avoid parsing large files unnecessarily.
- Use targeted, surgical reads/writes and avoid reading complete directories or files unless absolutely necessary.

## 2. File Tree Synchronization
- Any change in the file tree — creating, deleting (suppressing), or moving files or directories — **must** be reflected in `./CODEBASE.md`.
- Update the Directory Tree and, when the change affects architecture or module layout, the Module Breakdown as well.
- Do not leave `CODEBASE.md` describing a stale tree after a structural change.

## 3. Verification and Testing Mandate
- **Do not run functional tests.** Keep test execution focused strictly on code syntax, build-level checks, and static verification.
- Always check that the code syntax is perfectly valid, typescript checks pass, and there are no compilation/transpilation errors.
- Leave functional test execution and full behavior validation to the user.

## 4. Commit After Changes
When you finish a code change, **create the git commit**. Do not leave the work unstaged or uncommitted, and do not only propose a commit message for the user to apply later.

- Stage the files you changed for the task (do not include unrelated dirty files).
- Create the commit immediately using the message template below.
- Then show the user the commit hash and subject.

## 5. Commit Message Convention
Every commit must use this template:

```
<component>: <Title>

<body>

Signed-off-by: Abdullah Ozer <abdullahozer11@hotmail.com>
```

- `<component>`: The primary area/component or file group being modified (e.g., `api`, `components`, `providers`, `translations`).
- `<Title>`: Concise summary of the change.
- `<body>`: Bulleted or paragraph summary of changes made and their technical reasons.
- Signature line `Signed-off-by: Abdullah Ozer <abdullahozer11@hotmail.com>` must always be included.

## 6. GitHub Issues and Pull Requests
Land work on `master` through an issue and a pull request. Do not wait for the user to ask for this workflow.

- Open a GitHub issue first (or reuse an existing issue that already describes the work). Include a short summary and acceptance criteria.
- Branch from latest `origin/master` as `{issue-number}-{short-slug}` (example: `16-remove-unused-heavy-deps`).
- Commit with the signed-off-by template in section 5.
- Push the branch and open a pull request targeting `master`. The PR body must include `Fixes #<issue>`.
- This repository cannot enable GitHub auto-merge. After CI is green, the user merges the PR. Do not leave the work only as a local branch.

## 7. Agent Skills
This repo vendors official Supabase skills under `.agents/skills/` (Grok also sees relative links in `.grok/skills/`). Use `supabase` for Auth, Realtime, Edge Functions, CLI, MCP, and supabase-js work. Use `supabase-postgres-best-practices` before schema, migration, RLS, index, or SQL changes. Section 3 still applies: do not run functional tests. Refresh with `npx skills update`.
