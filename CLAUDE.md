# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All apps run with Bun (no transpile step needed — Bun executes TypeScript directly).

```bash
# Run the Discord bot (also starts Hono HTTP server on port 4000)
cd apps/bot && bun run src/index.ts

# Run the Strava web server
cd apps/webstrava && bun run index.ts

# Start Postgres + pgAdmin (port 5050) via Docker
docker compose up postgres pgadmin

# Apply the DB schema (run once against a fresh Postgres instance)
psql -U <user> -d <db> -f infra/sql/01_master.sql

# Deploy commands to Discord (run after adding/changing slash commands)
cd apps/bot && bun run src/deploy-commands.ts

# Build the shared package (only needed if consuming the dist output)
cd packages/shared && bun run build
```

There are no tests at this time.

## Architecture

This is a Bun monorepo with three packages:

```
apps/bot          — Discord bot + internal HTTP API (Hono, port 4000)
apps/webstrava    — Public-facing Strava OAuth + webhook receiver (Hono)
packages/shared   — Shared DB helpers and Hono middleware
```

**Database**: Bun's built-in `sql` tagged template (postgres) is used directly everywhere — no ORM. The schema lives in `infra/sql/01_master.sql`. Core tables: `users` (keyed on `discord_id`), `strava_accounts`, `oauth_states` (short-lived, 10-min TTL), `strava_activities`.

### Data & event flow

1. **Link flow** — User runs `/link-strava` in Discord → bot calls `registerUserReq` (upserts user, creates an `oauth_states` row) → bot DMs user a Strava OAuth URL with the state token → user completes OAuth → `webstrava` handles `GET /auth/strava/callback`, validates state, exchanges code, inserts into `strava_accounts`.

2. **Activity flow** — Strava sends a webhook `POST /webhook` to `webstrava` → app fetches the full activity from Strava API (refreshing token if needed) → inserts into `strava_activities` → calls `POST /strava/activity` on the bot's internal API → bot queries DB for activity + weekly stats → formats and sends a Discord embed via `sendEmbed`/`formatActivity`.

3. **Internal API auth** — Requests from `webstrava` → `bot` are authenticated via the `backendService` middleware (`x-internal-secret` header checked against `INTERNAL_SECRET` env var). This middleware lives in `packages/shared`.

### Discord command system

Commands are auto-discovered: `handler.ts` scans all `.ts` files under `src/commands/` (excluding `handler.ts` and `command.ts`) and registers them by `command.data.name`. Each command file exports a default object matching the `Command` interface (`data: SlashCommandBuilder`, `execute: (interaction) => Promise<void>`).

### Key env vars

**apps/bot**: `DISCORD_TOKEN`, `DISCORD_STRAVA_CHANNEL_ID`, `STRAVA_CLIENT_ID`, `STRAVA_REDIRECT_URI`, `INTERNAL_SECRET`, `PORT`

**apps/webstrava**: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_VERIFY_TOKEN`, `STRAVA_BOT_ENDPOINT`, `INTERNAL_SECRET`

**docker-compose / root**: `DATABASE_USER`, `DATABASE_PWD`, `DATABASE_DB`, `PGADMIN_EMAIL`, `PGADMIN_PWD`
