import { Hono } from "hono";

export const stravaRoutes = new Hono();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN!;

/**
 * OAuth Redirect
 */
stravaRoutes.get("/auth/strava/callback", async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");

    if (!code || !state) {
        return c.text("Missing auth code or state", 400);
    }

    // Exchange code for token
    const res = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code,
            grant_type: "authorization_code"
        })
    });

    const data: any = await res.json();

    if (!data || !data.token_type || !data.expires_in || !data.expires_at || !data.refresh_token || !data.access_token || !data.athlete) {
        console.error("Invalid token response from Strava:", data);
        return c.text("Failed to authenticate with Strava", 500);
    }

    /*
    data contains:
    {
    "token_type": "Bearer",
    "expires_at": 1568775134,
    "expires_in": 21600,
    "refresh_token": "e5n567567...",
    "access_token": "a4b945687g...",
    "athlete": {
      #{summary athlete representation}
    }
    }
    */

    const discordUserId = state;

    // Save to database
    console.log("Linked user:", discordUserId, data.athlete.id);

    // Possibly notify user on Discord that linking was successful
    //  could use redis pub/sub to send a DM
    return c.text("Strava account linked! You can return to Discord.");
})

/**
 * Webhook verification (Strava calls this when registering webhook)
 */
stravaRoutes.get("/webhook", (c) => {
    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge");

    if (mode === "subscribe" && token === STRAVA_VERIFY_TOKEN) {
        return c.json({
            "hub.challenge": challenge
        })
    }

    return c.text("Verification failed", 403);
})

/**
 * Webhook event receiver
 */
stravaRoutes.post("/webhook", async (c) => {
    const body = await c.req.json();

    /*
    Example body:
    {
      "object_type": "activity",
      "aspect_type": "create",
      "object_id": 123,
      "owner_id": 456,
      "subscription_id": 789
    }
    */
    console.log("Strava Event:", body);

    const athleteId = body.owner_id;
    const activityId = body.object_id;

    // Lookup your DB for Discord user
    // using athleteId

    // Then fetch activity
    if (body.aspect_type === "create") {
        console.log("New activity:", activityId);
    }

    await fetch("http://localhost:4000/strava/activity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "aspect_type": "create",
            "event_time": 1763421152,
            "object_id": 16489479978,
            "object_type": "activity",
            "owner_id": 128421832,
            "subscription_id": 307023,
            "updates": {}
        })
    });

    return c.text("ok");
})