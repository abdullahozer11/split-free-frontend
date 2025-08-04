# Supabase CLI Cheat Sheet

This cheat sheet covers common Supabase CLI commands for terminal use, including initialization, local development, database operations, migrations, and more. Commands are organized by category. For full details, refer to the official Supabase documentation.

## Installation
- **npm (as dev dependency)**: `npm install supabase --save-dev`
  - Run commands with: `npx supabase <command>`
- **Global install (npm)**: `npm install -g supabase`
- **Homebrew (macOS)**: `brew install supabase/tap/supabase`
- **Scoop (Windows)**: `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` then `scoop install supabase`
- **Update**: Use the same installation method (e.g., `npm update supabase --save-dev` or `brew upgrade supabase`)

## Global Flags
These apply to all commands:
- `--create-ticket`: Create a support ticket for CLI errors.
- `--debug`: Output debug logs.
- `--dns-resolver <native|https>`: Specify DNS resolver.
- `--experimental`: Enable experimental features.
- `-h, --help`: Show help.
- `--network-id <string>`: Use a specific Docker network.
- `-o, --output <env|pretty|json|toml|yaml>`: Output format.
- `--workdir <string>`: Path to Supabase project directory.
- `--yes`: Auto-answer yes to prompts.

## Authentication and Linking
- `supabase login [flags]`: Log in to Supabase account.
  - Flags: `--name <string>` (token name), `--no-browser` (no auto-open browser), `--token <string>` (provide token directly).
- `supabase link [flags]`: Link local project to remote Supabase project.
  - Flags: `--project-ref <string>` (project reference ID).
- `supabase unlink`: Unlink local project from remote.

## Initialization and Setup
- `supabase init [flags]`: Initialize local Supabase project (creates `supabase/config.toml`).
  - Flags: `--force` (overwrite existing config), `--use-orioledb` (use OrioleDB engine), `--with-intellij-settings` (generate IntelliJ settings), `--with-vscode-settings` (generate VS Code settings).
- `supabase bootstrap [template] [flags]`: Bootstrap project with a template.
  - Flags: `-p, --password <string>` (remote DB password).

## Local Development
- `supabase start [flags]`: Start local Supabase stack (requires Docker).
  - Flags: `-x, --exclude <strings>` (exclude services, e.g., "storage,auth"), `--ignore-health-check` (ignore unhealthy services).
- `supabase stop [flags]`: Stop local Supabase stack.
  - Flags: `--all` (stop all instances), `--no-backup` (delete data volumes), `--project-id <string>` (specific project ID).
- `supabase status [flags]`: Show local stack status.
  - Flags: `--override-name <strings>` (override variable names).

## Database Operations
- `supabase db diff [flags]`: Generate schema diff between local/remote.
  - Flags: `--db-url <string>` (DB connection string), `--file <string>` (output file), `--linked` (use linked project), `--local` (use local DB), `-p, --password <string>`, `-s, --schema <strings>`, `--use-migra` (use migra tool), `--use-pgadmin` (use pgAdmin tool).
- `supabase db dump [flags]`: Dump database schema or data.
  - Flags: `--data-only` (dump data only), `--db-url <string>`, `--dry-run`, `--linked`, `--local`, `--password <string>`, `--role-only` (dump roles), `--schema <strings>`, `--use-copy` (use COPY for data).
- `supabase db pull [migration name] [flags]`: Pull changes from remote DB to local migration.
  - Flags: `--db-url <string>`, `--linked`, `--local`, `--password <string>`, `--schema <strings>`.
- `supabase db push [flags]`: Push local migrations to remote DB.
  - Flags: `--db-url <string>`, `--dry-run`, `--include-all`, `--include-roles`, `--include-seed`, `--linked`, `--local`, `--password <string>`.
- `supabase db reset [flags]`: Reset local database to clean state (reapplies migrations).
  - Flags: `--linked` (use linked project), `--local` (default).
- `supabase inspect db vacuum-stats`: Show vacuum statistics for tables.
- supabase db diff -f change_on_database_explained

## Migrations
- `supabase migration list [flags]`: List local and remote migrations.
  - Flags: `--db-url <string>`, `--linked`, `--local`, `--password <string>`.
- `supabase migration new <name>`: Create a new migration file.
- `supabase migration repair [flags]`: Repair migration history (e.g., mark as applied).
  - Flags: `--dry-run`, `--status <applied|reverted>`.
- `supabase migration squash`: Squash multiple migrations into one.

## Type Generation
- `supabase gen types <language> [flags]`: Generate types from DB schema (e.g., `typescript`).
  - Languages: typescript, swift, kotlin, etc.
  - Flags: `--db-url <string>`, `--exclude-schema <strings>`, `-f, --output-file <string>`, `--linked`, `--local`, `--schema <strings>`.

## Edge Functions
- `supabase functions new <name>`: Create a new Edge Function.
- `supabase functions deploy <name> [flags]`: Deploy Edge Function to remote.
  - Flags: `--no-verify-jwt` (disable JWT verification).
- `supabase functions serve [flags]`: Serve functions locally.
  - Flags: `--env-file <string>` (env file path).

## Project Management
- `supabase projects list`: List all accessible projects.
- `supabase projects create <name> [flags]`: Create a new project.
  - Flags: `--db-password <string>`, `--org-id <string>`, `--region <string>`, `--plan <free|pro>`.
- `supabase projects delete <ref>`: Delete a project.
- `supabase api keys`: Retrieve project API keys.

## Secrets
- `supabase secrets list [flags]`: List secrets in linked project.
- `supabase secrets set <name>=<value> ...`: Set secret(s).
- `supabase secrets unset <name> ...`: Unset secret(s).

## Other
- `supabase config update [flags]`: Update remote config from local `config.toml`.
- `supabase sso [subcommand]`: Manage SSO (e.g., `add`, `list`, `get`).
  - Subcommands: add, get, list, update; Flags: `--metadata-url`, `--domains`, etc.
- `supabase domains [subcommand]`: Manage custom domains (e.g., `activate`, `create`).
- apply data_dump to database
  - PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres < data_dump.sqls

To download this cheat sheet, copy the content into a file named `supabase-cli-cheat-sheet.md` and save it.
