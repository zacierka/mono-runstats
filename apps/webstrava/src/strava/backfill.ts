import { sql } from "bun";
import { STRAVA_API_BASE } from "@packages/shared/src/strava/api";

export async function backfillHistoricalActivities(accountId: string, accessToken: string): Promise<void> {
    let page = 1;
    let totalInserted = 0;
    let hasMore = true;

    console.log(`Backfill started for account: ${accountId}`);

    while (hasMore) {
        const res = await fetch(
            `${STRAVA_API_BASE}/athlete/activities?per_page=200&page=${page}`,
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

        let pageInserted = 0;
        await sql.begin(async (tx) => {
            for (const a of activities) {
                const [row] = await tx`
                    INSERT INTO strava_activities (
                        strava_account_id, strava_activity_id, name, sport_type,
                        distance_meters, moving_time_seconds, elevation_gain, raw_data, start_date
                    )
                    VALUES (
                        ${accountId}, ${a.id}, ${a.name ?? null}, ${a.sport_type ?? null},
                        ${a.distance ?? null}, ${a.moving_time ?? null}, ${a.total_elevation_gain ?? null},
                        ${JSON.stringify(a)}, ${a.start_date ?? null}
                    )
                    ON CONFLICT (strava_activity_id) DO NOTHING
                    RETURNING strava_activity_id
                `;
                if (row) pageInserted++;
            }
        });

        totalInserted += pageInserted;
        page++;
    }

    console.log(`Backfill complete for account ${accountId}: ${totalInserted} activities imported`);
}
