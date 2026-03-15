import "dotenv/config";
import { REST, Routes, Snowflake } from "discord.js";
import path from "node:path";
import { log } from "node:console";
async function deploy() {
  const commands: any[] = [];

  const glob = new Bun.Glob("**/*.ts");
  const commandsPath = path.join(process.cwd(), "src/commands");

  for await (const file of glob.scan(commandsPath)) {
    log(`Processing command file: ${file}`);
    if (file.endsWith("index.ts") || file.endsWith("handler.ts") || file.endsWith("command.ts")) continue;

    const fullPath = path.join(commandsPath, file);
    const command = (await import(fullPath)).default;

    if (!command?.data) {
      console.warn(`⚠️ Skipping invalid command file: ${file}`);
      continue;
    }

    commands.push(command.data.toJSON());
  }

  if (commands.length === 0) {
    console.warn("⚠️ No valid commands found to deploy.");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN! as string);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID! as Snowflake,
      process.env.DISCORD_GUILD_ID! as Snowflake
    ),
    { body: commands }
  );

  console.log(`✅ Successfully deployed ${commands.length} commands.`);
}

deploy();