import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../command";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  async execute(interaction) {
    console.log("executed ", this.data.name);
    
    await interaction.reply("Pong!");
  },
};

export default command;