import { SharedSlashCommand, ChatInputCommandInteraction } from "discord.js";

export interface Command {
  data: SharedSlashCommand;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}