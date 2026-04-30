import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../command";
import {
  registerUserReq,
  DiscordUser,
} from "@packages/shared/src/database/discord";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("link-strava")
    .setDescription("Link your Strava account"),

  async execute(interaction) {
    let ctx = "I've sent you a DM with instructions to link your Strava account!";

    const CLIENTID = process.env.STRAVA_CLIENT_ID as string;
    const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI as string;
    const scope = "read,activity:read_all";

    const user: DiscordUser = {
      uid: interaction.user.id,
      username: interaction.user.username,
      avatarURL: interaction.user.avatar,
    };

    if (!interaction.guildId || !interaction.channelId) {
      await interaction.reply({
        content: "This command can only be used in a server",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const state = await registerUserReq(user, interaction.guildId, interaction.channelId);
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENTID}&response_type=code&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&approval_prompt=force&scope=${scope}&state=${state}`;

      const button = new ButtonBuilder()
        .setLabel("Link Strava Account")
        .setStyle(ButtonStyle.Link)
        .setURL(authUrl);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
      try {
        await interaction.user.send({
          content:
            "To link your Strava account, please click the following link",
          components: [row],
        });
      } catch (dmErr) {
        console.error("DM failed:", dmErr);

        ctx = "I couldn't DM you. Please enable DMs from server members and try again.";
      }
    } catch (err: any) {
      console.error("RegisterUserReq failed:", err);

      ctx = "Something went wrong while starting authentication. Try again later.";
    }

    await interaction.reply({
      content: ctx,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;