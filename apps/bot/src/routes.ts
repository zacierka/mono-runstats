import { Hono, } from "hono";
import { sendMessage, sendEmbed, editEmbed, botHealth } from "./discord";
import { formatActivity } from "./strava/format";
import { sql } from "bun";
import { backendService } from "@packages/shared/src/hono/middleware";
const routes = new Hono();

// ─── Health check
routes.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime(), botUptime: botHealth() });
});

async function fetchActivity(activity_id: number | bigint) {
  const [activity] = await sql`
    SELECT
      sa.strava_activity_id,
      sa.name,
      sa.sport_type,
      sa.distance_meters,
      sa.moving_time_seconds,
      sa.elevation_gain,
      sa.start_date,
      sa.discord_message_id,
      u.discord_id,

      COUNT(*) FILTER (
        WHERE sa2.sport_type = 'Run'
          AND sa2.start_date >= date_trunc('week', now())
      )::int AS weekly_run_count,

      COALESCE(ROUND((
        SUM(sa2.distance_meters) FILTER (
          WHERE sa2.sport_type = 'Run'
            AND sa2.start_date >= date_trunc('week', now())
        ) / 1609.344
      )::numeric, 2), 0) AS weekly_miles

    FROM strava_activities sa
    JOIN strava_accounts acc ON acc.id = sa.strava_account_id
    JOIN users u             ON u.id   = acc.user_id
    JOIN strava_activities sa2 ON sa2.strava_account_id = acc.id

    WHERE sa.strava_activity_id = ${activity_id}
    GROUP BY sa.strava_activity_id, sa.name, sa.sport_type,
             sa.distance_meters, sa.moving_time_seconds,
             sa.elevation_gain, sa.start_date, sa.discord_message_id, u.discord_id
  `;
  return activity ?? null;
}

// ─── Strava activity msg
routes.post("/strava/activity", backendService, async (c) => {
  const { activity_id } = await c.req.json();
  if (!activity_id) return c.json({ error: "Invalid payload" }, 400);

  const activity = await fetchActivity(activity_id);
  if (!activity) return c.text("Activity not found", 404);

  const messageId = await sendEmbed(formatActivity(activity, activity.discord_id));

  await sql`
    UPDATE strava_activities
    SET discord_message_id = ${messageId}
    WHERE strava_activity_id = ${activity_id}
  `;

  return c.text("ok");
});

// ─── Strava activity update
routes.post("/strava/activity/update", backendService, async (c) => {
  const { activity_id } = await c.req.json();
  if (!activity_id) return c.json({ error: "Invalid payload" }, 400);

  const activity = await fetchActivity(activity_id);
  if (!activity) return c.text("Activity not found", 404);
  if (!activity.discord_message_id) return c.text("No Discord message to edit", 200);

  await editEmbed(activity.discord_message_id, formatActivity(activity, activity.discord_id));

  return c.text("ok");
});

// ─── Raw text message
routes.post("/message", backendService, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const text = body?.text ?? "Empty message.";

  await sendMessage(text);

  return c.json({ ok: true, text });
});

export default routes;