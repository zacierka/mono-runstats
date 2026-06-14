import { ActivityType, Client, Collection, Events, GatewayIntentBits, PresenceData, TextChannel } from "discord.js";
import type { EmbedPayload } from "./types";
import { loadCommands } from "./commands/handler";
import { sql } from "bun";
const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_STRAVA_CHANNEL_ID as string;
let statusInterval: NodeJS.Timeout;

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
  startStatusRotation().catch((err) => console.error("[Discord] Status rotation failed:", err));
  resolveReady();
});

await loadCommands(client);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  
  if (!command) return;
  console.log(`Command: /${command.data.name} by ${interaction.user.tag}`);

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

function buildEmbed(embed: EmbedPayload) {
  const { EmbedBuilder } = require("discord.js");
  const builder = new EmbedBuilder();
  if (embed.title) builder.setTitle(embed.title);
  if (embed.description) builder.setDescription(embed.description);
  if (embed.color !== undefined) builder.setColor(embed.color);
  if (embed.fields) builder.addFields(embed.fields);
  if (embed.footer) builder.setFooter(embed.footer);
  if (embed.timestamp) builder.setTimestamp(new Date(embed.timestamp));
  return builder;
}

export async function sendEmbed(embed: EmbedPayload): Promise<string> {
  await waitForReady();

  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isSendable()) {
    throw new Error(
      `Channel ${channelId} not found or is not a sendable text channel.`
    );
  }

  const message = await (channel as TextChannel).send({ embeds: [buildEmbed(embed)] });
  return message.id;
}

export async function editEmbed(messageId: string, embed: EmbedPayload): Promise<void> {
  await waitForReady();

  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isSendable()) {
    throw new Error(
      `Channel ${channelId} not found or is not a sendable text channel.`
    );
  }

  const message = await (channel as TextChannel).messages.fetch(messageId);
  await message.edit({ embeds: [buildEmbed(embed)] });
}

async function startStatusRotation() {
  let statuses: PresenceData[];
  try {
    statuses = await buildStatuses();
  } catch (err) {
    console.error("[Discord] Could not build statuses (retrying in 30s):", err);
    setTimeout(() => {
      startStatusRotation().catch((e) => console.error("[Discord] Status rotation retry failed:", e));
    }, 30_000);
    return;
  }

  let index = 0;

  const rotate = () => {
    if (!statuses.length) return;
    client.user?.setPresence(statuses[index % statuses.length]);
    index++;
  };

  rotate();

  if (statusInterval) clearInterval(statusInterval);
  statusInterval = setInterval(rotate, 4 * 60 * 60 * 1000);
}

async function buildStatuses(): Promise<PresenceData[]> {
  const [{ count: userCount }] = await sql`
    SELECT COUNT(*) as count FROM strava_accounts
  `;

  const [{ count: todayCount }] = await sql`
    SELECT COUNT(*) as count 
    FROM strava_activities
    WHERE start_date >= CURRENT_DATE
      AND sport_type = 'Run'
  `;

  const statuses: PresenceData[] = [
    {
      activities: [{ name: `${userCount} athletes connected`, type: ActivityType.Watching }],
      status: "online",
    },
    {
      activities: [
        {
          name: todayCount > 0 ? `${todayCount} runs today` : `😴 No runs yet today...`,
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    }
  ];
  
  return statuses;
}

export default client;