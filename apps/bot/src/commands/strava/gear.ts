import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../command";
import { sql } from "bun";

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
            const targetUser = interaction.options.getUser("user") || interaction.user;

            const [account] = await sql`
                SELECT sa.raw_athlete
                FROM strava_accounts sa
                JOIN users u ON u.id = sa.user_id
                WHERE u.discord_id = ${targetUser.id}
            `;

            if (!account) {
                await interaction.reply({
                    content: `${targetUser.username} hasn't linked their Strava account.`,
                });
                return;
            }

            const shoes: any[] = account.raw_athlete?.shoes ?? [];

            if (!shoes.length) {
                await interaction.reply({
                    content: `${targetUser.username} has no shoes registered on Strava.`,
                });
                return;
            }

            const lines = shoes.map((s: any) => {
                const miles = (s.distance / 1609.344).toFixed(1);
                return `${s.primary ? "👟 " : ""}**${s.name}** — ${miles} mi`;
            });

            await interaction.reply({
                content: `**${targetUser.username}'s Shoes**\n${lines.join("\n")}`,
            });
        }
    },
};

export default command;
