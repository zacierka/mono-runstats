import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../command";
import { sql } from "bun";
import { refreshStravaToken } from "@packages/shared/src/strava/tokenHandler";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("athlete")
        .setDescription("Athlete-related commands")
        .addSubcommand(subcommand =>
            subcommand
                .setName("gear")
                .setDescription("View a user's gear")
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription("The user to view gear for")
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "gear") {
            await interaction.deferReply();

            const targetUser = interaction.options.getUser("user") || interaction.user;

            const [account] = await sql`
                SELECT sa.id, sa.access_token, sa.token_expires_at
                FROM strava_accounts sa
                JOIN users u ON u.id = sa.user_id
                WHERE u.discord_id = ${targetUser.id}
            `;

            if (!account) {
                await interaction.editReply(`${targetUser.username} hasn't linked their Strava account.`);
                return;
            }

            let accessToken = account.access_token;
            if (new Date(account.token_expires_at) <= new Date()) {
                accessToken = await refreshStravaToken(account.id);
            }

            const res = await fetch("https://www.strava.com/api/v3/athlete", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                await interaction.editReply("Failed to fetch athlete data from Strava.");
                return;
            }

            const athlete = await res.json() as any;
            const shoes: any[] = athlete.shoes ?? [];

            if (!shoes.length) {
                await interaction.editReply(`${targetUser.username} has no shoes registered on Strava.`);
                return;
            }

            const lines = shoes.map((s: any) => {
                const miles = (s.distance / 1609.344).toFixed(1);
                return `${s.primary ? "👟 " : ""}**${s.name}** — ${miles} mi`;
            });

            await interaction.editReply(`**${targetUser.username}'s Shoes**\n${lines.join("\n")}`);
        }
    },
};

export default command;
