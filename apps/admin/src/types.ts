export type GuildInfo = {
  id: string;
  name: string;
  icon: string | null;
};

export type AdminSessionInfo = {
  guild: GuildInfo;
  discord_user_id: string;
  expires_at: string;
};

export type GuildConfig = {
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
};

export type ApiChannel = { id: string; name: string };
export type ApiRole = { id: string; name: string; color: number };
