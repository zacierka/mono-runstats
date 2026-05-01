import { Hono } from "hono";
import { sql } from "bun";
import { refreshStravaToken } from "../strava/tokenHandler";
export const stravaRoutes = new Hono();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN!;
const STRAVA_BOT_ENDPOINT = process.env.STRAVA_BOT_ENDPOINT!;
/**
 * OAuth Redirect
 * 
 */
stravaRoutes.get("/auth/strava/callback", async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");

    if (!code || !state) {
        return c.text("Missing auth code or state", 400);
    }

    const [oauthState] = await sql`
        UPDATE oauth_states
        SET used_at = now()
        WHERE state      = ${state}
          AND used_at    IS NULL
          AND expires_at > now()
        RETURNING user_id, discord_guild_id, discord_channel_id
    `;

    if (!oauthState) {
        return c.text("Invalid, expired, or already-used state token", 401);
    }

    const res = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code,
            grant_type: "authorization_code"
        })
    });

    const data: any = await res.json();

    if (!data?.token_type || !data?.expires_at || !data?.refresh_token || !data?.access_token || !data?.athlete) {
        console.error("Invalid token response from Strava:", data);
        return c.text("Failed to authenticate with Strava", 500);
    }

    await sql.begin(async (tx) => {
        await tx`
            INSERT INTO strava_accounts (
                user_id,
                strava_athlete_id,
                access_token,
                refresh_token,
                token_expires_at,
                scope,
                athlete_firstname,
                athlete_lastname,
                athlete_profile_pic,
                athlete_city,
                athlete_country
            )
            VALUES (
                ${oauthState.user_id},
                ${data.athlete.id},
                ${data.access_token},
                ${data.refresh_token},
                to_timestamp(${data.expires_at}),
                ${data.scope ?? "read,activity:read_all"},
                ${data.athlete.firstname ?? null},
                ${data.athlete.lastname ?? null},
                ${data.athlete.profile ?? null},
                ${data.athlete.city ?? null},
                ${data.athlete.country ?? null}
            )
            ON CONFLICT (strava_athlete_id) DO UPDATE SET
                user_id          = EXCLUDED.user_id,
                access_token     = EXCLUDED.access_token,
                refresh_token    = EXCLUDED.refresh_token,
                token_expires_at = EXCLUDED.token_expires_at,
                updated_at       = now()
        `;
    });

    console.log("Linked user:", oauthState.user_id, data.athlete.id);

    // Possibly notify user on Discord that linking was successful
    return c.text("Strava account linked! You can return to Discord.");
});

stravaRoutes.get("/webhook", (c) => {
    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge");

    if (mode === "subscribe" && token === STRAVA_VERIFY_TOKEN) {
        console.log(`Received Create Request from Strava: Success`);
        return c.json({
            "hub.challenge": challenge
        })
    }
    console.log(`Received Create Request from Strava: Failed`);
    
    return c.text("Verification failed", 403);
})

stravaRoutes.post("/webhook", async (c) => {
    const body = await c.req.json();

    console.log("Strava Event:", body);
    if (body.object_type !== "activity" || body.aspect_type !== "create") {
        return c.text("ok");
    }

    const athleteId = body.owner_id;
    const activityId = body.object_id;

    const [account] = await sql`
        SELECT id, access_token, token_expires_at
        FROM strava_accounts
        WHERE strava_athlete_id = ${athleteId}
    `;

    if (!account) {
        console.warn("Received webhook for unknown athlete:", athleteId);
        return c.text("ok");
    }

    let accessToken = account.access_token;
    if (new Date(account.token_expires_at) <= new Date()) {
        accessToken = await refreshStravaToken(account.id);
    }

    const activityRes = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!activityRes.ok) {
        console.error("Failed to fetch activity from Strava:", await activityRes.text());
        return c.text("ok");
    }

    const activity = await activityRes.json() as any;

    await sql`
        INSERT INTO strava_activities (
            strava_account_id,
            strava_activity_id,
            name,
            sport_type,
            distance_meters,
            moving_time_seconds,
            elevation_gain,
            raw_data,
            start_date
        )
        VALUES (
            ${account.id},
            ${activity.id},
            ${activity.name},
            ${activity.sport_type},
            ${activity.distance ?? null},
            ${activity.moving_time ?? null},
            ${activity.total_elevation_gain ?? null},
            ${JSON.stringify(activity)},
            ${activity.start_date}
        )
        ON CONFLICT (strava_activity_id) DO NOTHING
    `;

    console.log("Saved activity:", activity.id, activity.name, "for athlete:", athleteId);

    // fetch POST to discord bot
    await fetch(`http://${STRAVA_BOT_ENDPOINT}/strava/activity`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_SECRET
        },
        body: JSON.stringify({ activity_id: activity.id })
    });

    return c.text("ok");
});

