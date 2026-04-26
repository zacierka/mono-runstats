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

export function formatActivity(activity: any, discordId: string): Parameters<typeof sendEmbed>[0] {
    const distanceMiles = (activity.distance_meters / 1609.344).toFixed(2);
    const pacePerMile = activity.moving_time_seconds / (activity.distance_meters / 1609.344);
    const paceMinutes = Math.floor(pacePerMile / 60); 
    const paceSeconds = Math.round(pacePerMile % 60).toString().padStart(2, "0");
    const durationHours = Math.floor(activity.moving_time_seconds / 3600);
    const durationMinutes = Math.floor((activity.moving_time_seconds % 3600) / 60);
    const durationSeconds = (activity.moving_time_seconds % 60).toString().padStart(2, "0");
    const elevationFeet = Math.round(activity.elevation_gain * 3.28084);
    const weekly_miles = activity.weekly_miles;
    const weekly_run_count = activity.weekly_run_count;
    const duration = durationHours > 0
        ? `${durationHours}h ${durationMinutes}m ${durationSeconds}s`
        : `${durationMinutes}m ${durationSeconds}s`;

    return {
        title: `${activity.name}`,
        description: `<@${discordId}> just logged a ${activity.sport_type.toLowerCase()}!`,
        color: 0xFC4C02,
        fields: [
            { name: "Distance",              value: `**${distanceMiles} mi**`,                 inline: false },
            { name: "Duration",              value: duration,                                  inline: true },
            { name: "Pace",                  value: `${paceMinutes}:${paceSeconds}/mi`,        inline: true },
            { name: "Elevation",             value: `${elevationFeet} ft`,                     inline: true },
            { 
              name: "─────────────────────", 
              value: `**Weekly Distance**: ${weekly_miles} mi | **Run** #${weekly_run_count}`, 
              inline: false 
            },
        ],
        footer: { text: "Strava Activity" },
        timestamp: true,
    };
}

export default client;