export type GuildConfig = {
  id: string;
  guild_id: string;
  run_logs_channel_id: string | null;
  linked_role_id: string | null;
  units: "miles" | "km";
  timezone: string;
  embed_color: string;
  hide_strava_link: boolean;
  hide_location: boolean;
  hide_strava_pii: boolean;
  leaderboard_cron: string | null;
  weekly_stats_cron: string | null;
  min_distance_meters: number;
  sport_types_filter: string[];
  created_at: string;
  updated_at: string;
};

export type AdminSession = {
  id: string;
  token: string;
  guild_id: string;
  discord_user_id: string;
  expires_at: string;
};

export type SessionPayload = {
  guild_id: string;
  discord_user_id: string;
  expires_at: string;
};

export type DiscordChannel = {
  id: string;
  name: string;
};

export type DiscordRole = {
  id: string;
  name: string;
  color: number;
};
