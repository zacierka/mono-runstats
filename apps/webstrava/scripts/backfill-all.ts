import { sql } from "bun";
import { refreshStravaToken } from "../src/strava/tokenHandler";
import { backfillHistoricalActivities } from "../src/strava/backfill";

const accounts = await sql`
    SELECT id, access_token, token_expires_at, athlete_firstname, athlete_lastname
    FROM strava_accounts
    ORDER BY created_at
`;

console.log(`Found ${accounts.length} account(s) to backfill`);

for (const account of accounts) {
    const name = [account.athlete_firstname, account.athlete_lastname].filter(Boolean).join(" ") || account.id;
    console.log(`\nBackfilling: ${name}`);

    let accessToken = account.access_token;
    if (new Date(account.token_expires_at) <= new Date()) {
        console.log(`  Token expired, refreshing...`);
        accessToken = await refreshStravaToken(account.id);
    }

    await backfillHistoricalActivities(account.id, accessToken);
}

console.log("\nAll accounts backfilled.");
await sql.end();
