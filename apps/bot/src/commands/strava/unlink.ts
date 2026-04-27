import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../command";
import { sql } from "bun";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Remove your Strava account"),

    async execute(interaction) {
        const discordID = interaction.user.id;

        // Find the strava account linked to this discord user
        const [account] = await sql`
            SELECT sa.id, sa.strava_athlete_id, sa.access_token
            FROM strava_accounts sa
            JOIN users u ON u.id = sa.user_id
            WHERE u.discord_id = ${discordID}
        `;

        if (!account) {
            interaction.reply({
                content: "You don't have a Strava account linked.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const deauth = await fetch("https://www.strava.com/oauth/deauthorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: account.access_token })
        });

        console.log(`${discordID} requested to be unlinked: ${deauth.status == 200 ? "SUCCESS" : "FAILED"}`);
        

        await sql`
            DELETE FROM strava_accounts
            WHERE id = ${account.id}
        `.then((r) => console.log(`Deleted all DATA for ${discordID}`))
        .catch((e) => console.log(e));


        await interaction.reply({
            content: "Your account and activities have been removed from RunStats.",
            flags: MessageFlags.Ephemeral,
        });
    },
};

export default command;