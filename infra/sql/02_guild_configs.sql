CREATE TABLE guild_configs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id              TEXT NOT NULL UNIQUE,
  run_logs_channel_id   TEXT,
  linked_role_id        TEXT,
  units                 TEXT NOT NULL DEFAULT 'miles' CHECK (units IN ('miles', 'km')),
  timezone              TEXT NOT NULL DEFAULT 'UTC',
  embed_color           TEXT NOT NULL DEFAULT '#FC4C02',
  hide_strava_link      BOOLEAN NOT NULL DEFAULT false,
  hide_location         BOOLEAN NOT NULL DEFAULT false,
  hide_strava_pii       BOOLEAN NOT NULL DEFAULT false,
  leaderboard_cron      TEXT,
  weekly_stats_cron     TEXT,
  min_distance_meters   FLOAT NOT NULL DEFAULT 0,
  sport_types_filter    TEXT[] NOT NULL DEFAULT ARRAY['Run','Walk','Hike','Ride','Swim'],
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token            TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  guild_id         TEXT NOT NULL,
  discord_user_id  TEXT NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour')
);

CREATE INDEX ON admin_sessions (token);
CREATE INDEX ON guild_configs (guild_id);
