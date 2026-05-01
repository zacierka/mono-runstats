-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core user identity, keyed on Discord
CREATE TABLE users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id               TEXT UNIQUE,
  discord_username         TEXT,
  discord_avatar           TEXT,
  discord_email            TEXT,
  -- Web app: store Discord OAuth tokens for website login
  discord_access_token     TEXT,
  discord_refresh_token    TEXT,
  discord_token_expires_at TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One user can link multiple Strava accounts (uncommon but valid)
CREATE TABLE strava_accounts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_athlete_id    BIGINT NOT NULL UNIQUE,
  access_token         TEXT NOT NULL,
  refresh_token        TEXT NOT NULL,
  token_expires_at     TIMESTAMPTZ NOT NULL,
  scope                TEXT NOT NULL,              -- e.g. "read,activity:read_all"
  -- Cache basic athlete info so you're not hitting Strava API constantly
  athlete_firstname    TEXT,
  athlete_lastname     TEXT,
  athlete_profile_pic  TEXT,
  athlete_city         TEXT,
  athlete_country      TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Short-lived state tokens for the OAuth flow
-- Stores where the user came from so you can redirect back properly
CREATE TABLE oauth_states (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state               TEXT NOT NULL UNIQUE,        -- the ?state= param
  discord_guild_id    TEXT,                        -- which server initiated
  discord_channel_id  TEXT,                        -- which channel to reply in
  redirect_after      TEXT,                        -- web app: where to send them
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at             TIMESTAMPTZ                  -- null = unused, set on use
);

-- Cached Strava activity data
CREATE TABLE strava_activities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strava_account_id   UUID NOT NULL REFERENCES strava_accounts(id) ON DELETE CASCADE,
  strava_activity_id  BIGINT NOT NULL UNIQUE,
  name                TEXT,
  sport_type          TEXT,                        -- Run, Ride, Swim, etc.
  distance_meters     FLOAT,
  moving_time_seconds INT,
  elevation_gain      FLOAT,
  raw_data            JSONB,                       -- full Strava payload, queryable
  start_date          TIMESTAMPTZ,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX ON strava_accounts(user_id);
CREATE INDEX ON oauth_states(state);
CREATE INDEX ON oauth_states(expires_at) WHERE used_at IS NULL;
CREATE INDEX ON strava_activities(strava_account_id);
CREATE INDEX ON strava_activities(start_date DESC);
CREATE INDEX ON strava_activities USING GIN (raw_data);  -- for JSONB queries