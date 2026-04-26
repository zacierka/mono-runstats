import { sql } from "bun"

export async function refreshStravaToken(stravaAccountId: string): Promise<string> {
    const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
    const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

    const [account] = await sql`
        SELECT refresh_token FROM strava_accounts WHERE id = ${stravaAccountId}
    `;

    const res = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: account.refresh_token
        })
    });

    const data = await res.json() as any;

    await sql`
        UPDATE strava_accounts
        SET access_token     = ${data.access_token},
            refresh_token    = ${data.refresh_token},
            token_expires_at = to_timestamp(${data.expires_at}),
            updated_at       = now()
        WHERE id = ${stravaAccountId}
    `;

    return data.access_token;
};