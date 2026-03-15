import { Client, Collection, Events, GatewayIntentBits, TextChannel } from "discord.js";
import { loadCommands } from "./commands/handler";

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_STRAVA_CHANNEL_ID as string;

if (!token || !channelId) {
  throw new Error(
    "Missing required environment variables: DISCORD_TOKEN and DISCORD_STRAVA_CHANNEL_ID"
  );
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let resolveReady: () => void;
const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

client.once(Events.ClientReady, (c) => {
  console.log(`[Discord] Logged in as ${c.user.tag}`);
  resolveReady();
});

await loadCommands(client);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`Command Called: ${interaction.commandName} by ${interaction.user.tag}`);
  

  const command = client.commands.get(interaction.commandName);
  console.log(`Command resolved to ${command.data.name}`);
  
  if (!command) return;

  await command.execute(interaction);
  
});

client.login(token);

export function botHealth() {
  return client.uptime;
}

export async function waitForReady(): Promise<void> {
  await readyPromise;
}

export async function sendMessage(content: string): Promise<void> {
  await waitForReady();

  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isSendable()) {
    throw new Error(
      `Channel ${channelId} not found or is not a sendable text channel. ` +
        `Make sure the bot has permission to send messages there.`
    );
  }

  await (channel as TextChannel).send(content);
}

export async function sendEmbed(embed: {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: boolean;
}): Promise<void> {
  await waitForReady();

  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isSendable()) {
    throw new Error(
      `Channel ${channelId} not found or is not a sendable text channel.`
    );
  }

  const { EmbedBuilder } = await import("discord.js");
  const builder = new EmbedBuilder();

  if (embed.title) builder.setTitle(embed.title);
  if (embed.description) builder.setDescription(embed.description);
  if (embed.color !== undefined) builder.setColor(embed.color);
  if (embed.fields) builder.addFields(embed.fields);
  if (embed.footer) builder.setFooter(embed.footer);
  if (embed.timestamp) builder.setTimestamp();

  await (channel as TextChannel).send({ embeds: [builder] });
}

export default client;