import { sql } from "bun";

export async function backfillHistoricalActivities(accountId: string, accessToken: string): Promise<void> {
    let page = 1;
    let totalInserted = 0;

    console.log(`Backfill started for account: ${accountId}`);

    while (true) {
        const res = await fetch(
            `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!res.ok) {
            console.error(`Backfill: failed to fetch page ${page} for account ${accountId}:`, await res.text());
            break;
        }

        const activities = await res.json() as any[];

        if (activities.length === 0) break;

        for (const activity of activities) {
            const [inserted] = await sql`
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
                    ${accountId},
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
                RETURNING strava_activity_id
            `;
            if (inserted) totalInserted++;
        }

        page++;
    }

    console.log(`Backfill complete for account ${accountId}: ${totalInserted} activities imported`);
}
