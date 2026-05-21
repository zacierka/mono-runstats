import { sql } from "bun";

export async function backfillHistoricalActivities(accountId: string, accessToken: string): Promise<void> {
    let page = 1;
    let totalInserted = 0;
    let hasMore = true;

    console.log(`Backfill started for account: ${accountId}`);

    while (hasMore) {
        const res = await fetch(
            `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!res.ok) {
            console.error(`Backfill: failed to fetch page ${page} for account ${accountId}:`, await res.text());
            hasMore = false;
            continue;
        }

        const activities = await res.json() as any[];

        if (activities.length === 0) {
            hasMore = false;
            continue;
        }

        const inserted = await sql`
            INSERT INTO strava_activities (
                strava_account_id, strava_activity_id, name, sport_type,
                distance_meters, moving_time_seconds, elevation_gain, raw_data, start_date
            )
            SELECT * FROM unnest(
                ${activities.map(() => accountId)}::uuid[],
                ${activities.map((a: any) => a.id)}::bigint[],
                ${activities.map((a: any) => a.name ?? null)}::text[],
                ${activities.map((a: any) => a.sport_type ?? null)}::text[],
                ${activities.map((a: any) => a.distance ?? null)}::float8[],
                ${activities.map((a: any) => a.moving_time ?? null)}::int[],
                ${activities.map((a: any) => a.total_elevation_gain ?? null)}::float8[],
                ${activities.map((a: any) => JSON.stringify(a))}::jsonb[],
                ${activities.map((a: any) => a.start_date ?? null)}::timestamptz[]
            )
            ON CONFLICT (strava_activity_id) DO NOTHING
            RETURNING strava_activity_id
        `;

        totalInserted += inserted.length;
        page++;
    }

    console.log(`Backfill complete for account ${accountId}: ${totalInserted} activities imported`);
}
