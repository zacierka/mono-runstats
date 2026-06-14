import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { sql } from "bun";
import { ChannelType } from "discord.js";
import client from "./discord";
import type { SessionPayload, GuildConfig } from "@packages/shared/src/database/admin";

const ADMIN_URL = process.env.ADMIN_URL ?? "http://localhost:5173";

const adminSession = createMiddleware<{
  Variables: { session: SessionPayload };
}>(async (c, next) => {
  const token = c.req.header("x-admin-token") ?? c.req.query("token");
  if (!token) return c.json({ error: "Missing token" }, 401);

  const [session] = await sql`
    SELECT guild_id, discord_user_id, expires_at
    FROM admin_sessions
    WHERE token = ${token}
      AND expires_at > now()
  `;

  if (!session) return c.json({ error: "Invalid or expired session" }, 401);

  c.set("session", session as SessionPayload);
  await next();
});

const adminRoutes = new Hono();

adminRoutes.use(
  "/admin/*",
  cors({
    origin: ADMIN_URL,
    allowHeaders: ["Content-Type", "x-admin-token"],
    allowMethods: ["GET", "PUT", "OPTIONS"],
  })
);

// Validate session and return guild info
adminRoutes.get("/admin/session", adminSession, async (c) => {
  const { guild_id, discord_user_id, expires_at } = c.get("session");
  const guild = await client.guilds.fetch(guild_id);
  return c.json({
    guild: { id: guild.id, name: guild.name, icon: guild.icon },
    discord_user_id,
    expires_at,
  });
});

// Get guild config (creates default row on first access)
adminRoutes.get("/admin/config", adminSession, async (c) => {
  const { guild_id } = c.get("session");

  await sql`
    INSERT INTO guild_configs (guild_id)
    VALUES (${guild_id})
    ON CONFLICT (guild_id) DO NOTHING
  `;

  const [config] = await sql`
    SELECT * FROM guild_configs WHERE guild_id = ${guild_id}
  `;

  return c.json(config as GuildConfig);
});

// Update guild config (explicit whitelist — never trust the full body)
adminRoutes.put("/admin/config", adminSession, async (c) => {
  const { guild_id } = c.get("session");
  const body = await c.req.json();

  const [updated] = await sql`
    UPDATE guild_configs SET
      run_logs_channel_id = ${body.run_logs_channel_id ?? null},
      linked_role_id      = ${body.linked_role_id ?? null},
      units               = ${body.units ?? "miles"},
      timezone            = ${body.timezone ?? "UTC"},
      embed_color         = ${body.embed_color ?? "#FC4C02"},
      hide_strava_link    = ${body.hide_strava_link ?? false},
      hide_location       = ${body.hide_location ?? false},
      hide_strava_pii     = ${body.hide_strava_pii ?? false},
      leaderboard_cron    = ${body.leaderboard_cron ?? null},
      weekly_stats_cron   = ${body.weekly_stats_cron ?? null},
      min_distance_meters = ${body.min_distance_meters ?? 0},
      sport_types_filter  = ${sql.array(body.sport_types_filter ?? ["Run", "Walk", "Hike", "Ride", "Swim"])},
      updated_at          = now()
    WHERE guild_id = ${guild_id}
    RETURNING *
  `;

  if (!updated) return c.json({ error: "Config not found" }, 404);
  return c.json(updated as GuildConfig);
});

// List text channels in the guild
adminRoutes.get("/admin/channels", adminSession, async (c) => {
  const { guild_id } = c.get("session");
  const guild = await client.guilds.fetch(guild_id);
  const channels = await guild.channels.fetch();

  const textChannels = channels
    .filter((ch) => ch !== null && ch.type === ChannelType.GuildText)
    .map((ch) => ({ id: ch!.id, name: ch!.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return c.json(textChannels);
});

// List assignable roles in the guild
adminRoutes.get("/admin/roles", adminSession, async (c) => {
  const { guild_id } = c.get("session");
  const guild = await client.guilds.fetch(guild_id);
  const roles = await guild.roles.fetch();

  const roleList = roles
    .filter((r) => r !== null && !r.managed && r.name !== "@everyone")
    .map((r) => ({ id: r!.id, name: r!.name, color: r!.color }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return c.json(roleList);
});

export default adminRoutes;
