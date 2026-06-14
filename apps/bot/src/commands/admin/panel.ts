import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { sql } from "bun";
import type { Command } from "../command";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Open the RunStats admin dashboard for this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: "You need the **Manage Server** permission to use this.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const adminUrl = process.env.ADMIN_URL;
    if (!adminUrl) {
      await interaction.reply({
        content: "Admin dashboard is not configured on this instance.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const [session] = await sql`
      INSERT INTO admin_sessions (guild_id, discord_user_id)
      VALUES (${interaction.guildId}, ${interaction.user.id})
      RETURNING token, expires_at
    `;

    const link = `${adminUrl}?token=${session.token}`;

    await interaction.reply({
      content: `[Open Admin Dashboard](${link})\n-# This link expires in 1 hour and is private to you.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
