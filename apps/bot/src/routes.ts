import { Hono } from "hono";
import { sendMessage, sendEmbed, botHealth } from "./discord";
import { StravaFormatter, StravaRunActivity } from "./formatter/StravaFormatter";

const routes = new Hono();

// ─── Health check
routes.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime(), botUptime: botHealth() });
});

// ─── Strava activity msg
routes.post("/strava/activity", async (c) => {
  const body = await c.req.json().catch(() => ({}));

  // perform basic validation of the payload
  if (!body || !body.name || !body.distance || !body.moving_time) {
    return c.json({ error: "Invalid payload. Expected StravaRunActivity format." }, 400);
  }

  const activity = body as StravaRunActivity;

  // idea: generate PNG from segment data

  await sendEmbed(StravaFormatter.stravaRun(activity));

  return c.json({ ok: true, message: `Sent Discord message for activity ${activity.name}` });
});

// ─── Raw text message
routes.post("/message", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const text = body?.text ?? "Empty message.";

  await sendMessage(text);

  return c.json({ ok: true, text });
});

export default routes;