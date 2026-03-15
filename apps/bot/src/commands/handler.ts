import { Client, Collection } from "discord.js";
import { Command } from "./command";
import { readdir } from "node:fs/promises";
import path from "node:path";

// this doesnt load any commands. Need to copy the deploy-commands logic to here (uses glob)
export async function loadCommands(client: Client) {
  client.commands = new Collection<string, Command>();  
  const glob = new Bun.Glob("**/*.ts");
  const commandsPath = path.join(process.cwd(), "src/commands");

  for await (const file of glob.scan(commandsPath)) {
    if (!file.endsWith(".ts") || file === "handler.ts" || file === "command.ts") continue;

    const filePath = path.join(commandsPath, file);
    const commandModule = await import(filePath);
    const command: Command = commandModule.default;

    client.commands.set(command.data.name, command);
    console.log(`Loaded Command: ${command.data.name}`);
    
  }
}
