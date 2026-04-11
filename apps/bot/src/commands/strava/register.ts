import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../command";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Link your Strava account"),

  async execute(interaction) {
    // respond with a link to the Strava authentication page
    const CLIENTID = process.env.STRAVA_CLIENT_ID as string;
    const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI as string;
    const scope = "read,activity:read_all";
    const state = interaction.user.id as string;
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENTID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}&state=${state}`;

    const button = new ButtonBuilder()
      .setLabel("Link Strava Account")
      .setStyle(ButtonStyle.Link)
      .setURL(authUrl);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    
    await interaction.user.send({ content: `To link your Strava account, please click the following link`, components: [row] });

    await interaction.reply({ content: "I've sent you a DM with instructions to link your Strava account!", flags: MessageFlags.Ephemeral });
  },
};

export default command;